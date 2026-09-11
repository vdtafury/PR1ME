import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MessageCircle, ArrowLeft, Minus, Plus, ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, productOrderLink, type OrderItem } from "@/lib/whatsapp";
import { ProductCard } from "@/components/ProductCard";
import { colorToHex } from "@/lib/colors";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store";
import useEmblaCarousel from "embla-carousel-react";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params: { slug } }) => {
    const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
    return { product: data as Product | null };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: 'Product Not Found' }] };
    return {
      meta: [
        { title: `${p.title} | PR1ME` },
        { name: 'description', content: p.short_description || p.title },
        { property: 'og:title', content: p.title },
        { property: 'og:description', content: p.short_description || p.title },
        { property: 'og:image', content: p.main_image || '' },
        { property: 'og:type', content: 'product' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: p.main_image || '' },
      ],
    };
  },
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link to="/products" className="mt-4 inline-block underline">Back to shop</Link>
    </div>
  ),
});

function ProductDetailPage() {
  const { slug } = Route.useParams();

  const productQ = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as Product;
    },
  });

  if (productQ.isLoading) {
    return <div className="mx-auto max-w-6xl animate-pulse px-4 py-10 sm:px-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-xl bg-muted" />
        <div className="space-y-3">
          <div className="h-8 w-2/3 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-20 w-full rounded bg-muted" />
        </div>
      </div>
    </div>;
  }

  return <ProductView product={productQ.data!} />;
}

function ProductView({ product: p }: { product: Product }) {
  const allImages = [p.main_image, ...(p.gallery_images ?? [])].filter(Boolean) as string[];
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(p.colors?.length === 1 ? p.colors[0] : null);
  const [selectedSize, setSelectedSize] = useState<string | null>(p.sizes?.length === 1 ? p.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "shipping" | "guide">("desc");
  const [isSizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [emblaRef] = useEmblaCarousel({ loop: true });

  // Global Cart
  const addItem = useCartStore((s) => s.addItem);

  const needsColor = (p.colors?.length ?? 0) > 0;
  const needsSize = (p.sizes?.length ?? 0) > 0;
  const canAdd = (!needsColor || !!selectedColor) && (!needsSize || !!selectedSize) && qty > 0;

  const handleAddToCart = () => {
    if (!canAdd) return;
    addItem(p, qty, selectedSize || undefined, selectedColor || undefined);
    // Optionally reset selection
    // setSelectedColor(null);
    // setSelectedSize(null);
    setQty(1);
  };

  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const handleBuyNow = () => {
    if (!canAdd) return;
    addItem(p, qty, selectedSize || undefined, selectedColor || undefined);
    setQty(1);
    setCartOpen(true);
  };

  const related = useQuery({
    queryKey: ["related", p.category_id, p.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*")
        .eq("is_available", true)
        .neq("id", p.id)
        .limit(10);
      if (error) throw error;
      
      const sameCategory = data.filter((x) => p.category_id && x.category_id === p.category_id);
      const otherCategory = data.filter((x) => !p.category_id || x.category_id !== p.category_id);
      
      return [...sameCategory, ...otherCategory].slice(0, 4) as Product[];
    },
  });

  const hasSale = p.original_price && p.original_price > p.price;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 relative">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          {/* Mobile Swipeable Carousel */}
          <div className="overflow-hidden rounded-xl border border-border bg-muted md:hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {allImages.length > 0 ? (
                allImages.map((src, idx) => (
                  <div className="relative min-w-0 flex-[0_0_100%] aspect-[4/5]" key={idx}>
                    <img src={src} alt={`${p.title} - ${idx + 1}`} className="h-full w-full object-cover" />
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white shadow backdrop-blur-sm">
                      {idx + 1} / {allImages.length}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid h-full w-full aspect-[4/5] place-items-center text-muted-foreground flex-[0_0_100%]">No image</div>
              )}
            </div>
          </div>

          {/* Desktop Image Viewer */}
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-xl border border-border bg-muted group/img md:block">
            {allImages[activeImg] ? (
              <img src={allImages[activeImg]} alt={p.title} className="h-full w-full object-cover" />
            ) : <div className="grid h-full w-full place-items-center text-muted-foreground">No image</div>}
            
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveImg((prev) => (prev - 1 + allImages.length) % allImages.length);
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground border border-border shadow hover:bg-background transition-opacity opacity-0 group-hover/img:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveImg((prev) => (prev + 1) % allImages.length);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground border border-border shadow hover:bg-background transition-opacity opacity-0 group-hover/img:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="hidden grid-cols-5 gap-2 md:grid">
              {allImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden rounded-md border bg-muted ${i === activeImg ? "border-primary ring-2 ring-primary/40" : "border-border"}`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{p.title}</h1>
          {p.short_description && <p className="mt-2 text-base text-muted-foreground">{p.short_description}</p>}
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-price">{formatPrice(p.price)}</span>
            {hasSale && <span className="text-base text-muted-foreground line-through">{formatPrice(p.original_price!)}</span>}
            {hasSale && <span className="rounded bg-sale px-2 py-0.5 text-xs font-bold uppercase text-white">Sale</span>}
          </div>
          {p.product_code && <p className="mt-1 text-xs text-muted-foreground">Code: {p.product_code}</p>}

          {needsColor && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Color: <span className="text-foreground normal-case font-bold">{selectedColor || "Select a color"}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.colors.map((c) => {
                  const active = c === selectedColor;
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all ${active ? "border-primary ring-2 ring-primary/30 bg-primary/5 font-semibold" : "border-border hover:border-foreground/40"}`}
                    >
                      <span className="h-4 w-4 rounded-full border border-border" style={{ background: colorToHex(c) }} />
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {needsSize && (
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Size: <span className="text-foreground normal-case font-bold">{selectedSize || "Select a size"}</span>
                </p>
                <button 
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Size Guide
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.sizes.map((s) => {
                  const active = s === selectedSize;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[2.75rem] rounded-md border px-3 py-1.5 text-sm font-semibold transition-all ${active ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground/40"}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-end gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Quantity</p>
              <div className="mt-2 inline-flex items-center rounded-md border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center hover:bg-muted"><Minus className="h-4 w-4" /></button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-10 w-14 border-x border-border bg-transparent text-center text-sm font-bold focus:outline-none"
                />
                <button onClick={() => setQty((q) => q + 1)} className="grid h-10 w-10 place-items-center hover:bg-muted"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row pb-24 md:pb-0">
            {/* Desktop Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAdd}
              className={`hidden md:flex flex-1 h-12 rounded-md font-bold text-sm shadow-sm transition-all border justify-center items-center gap-2 ${canAdd ? "bg-background text-foreground hover:bg-muted border-foreground/20" : "bg-muted text-muted-foreground border-border cursor-not-allowed"}`}
            >
              Add to Cart
            </button>
            {/* Desktop Buy It Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canAdd}
              className={`hidden md:flex flex-1 h-12 rounded-md font-bold text-sm shadow-sm transition-all border justify-center items-center gap-2 ${canAdd ? "bg-whatsapp text-white hover:bg-whatsapp-hover border-whatsapp" : "bg-muted text-muted-foreground border-border cursor-not-allowed"}`}
            >
              Buy It Now
            </button>
          </div>
          
          {/* Mobile Sticky Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md p-3 md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-bold text-price leading-tight">{formatPrice(p.price * qty)}</span>
              <span className="text-xs text-muted-foreground">Qty: {qty}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAdd}
                className={`h-11 flex-1 rounded-md font-bold text-xs shadow-sm transition-all border flex justify-center items-center gap-2 ${canAdd ? "bg-background text-foreground border-foreground/20" : "bg-muted text-muted-foreground border-border cursor-not-allowed"}`}
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!canAdd}
                className={`h-11 flex-1 rounded-md font-bold text-xs shadow-sm transition-all border flex justify-center items-center gap-2 ${canAdd ? "bg-whatsapp text-white border-whatsapp" : "bg-muted text-muted-foreground border-border cursor-not-allowed"}`}
              >
                Buy It Now
              </button>
            </div>
          </div>
          
          {!canAdd && (
            <div className="mt-3 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
              <span>Please select a color/size and set quantity to add to cart.</span>
            </div>
          )}

          {/* Premium Details Accordion / Tabs */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="flex border-b border-border mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("desc")}
                className={`pb-2 pr-4 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${activeTab === "desc" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Description
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shipping")}
                className={`pb-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${activeTab === "shipping" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Shipping & Delivery
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                className={`pb-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${activeTab === "guide" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Ordering Info
              </button>
            </div>
            
            <div className="text-sm leading-relaxed text-muted-foreground min-h-[80px]">
              {activeTab === "desc" && (
                <div className="whitespace-pre-line">
                  {p.description || p.short_description || "No further details available for this product."}
                </div>
              )}
              {activeTab === "shipping" && (
                <div className="space-y-2">
                  <p>🚀 <strong>Nationwide Shipping:</strong> We deliver to all governorates in Egypt.</p>
                  <p>📅 <strong>Delivery Time:</strong> 2 to 5 business days from order confirmation.</p>
                  <p>💵 <strong>Payment Method:</strong> Cash on Delivery (COD). You can open and inspect the package before paying the courier!</p>
                </div>
              )}
              {activeTab === "guide" && (
                <div className="space-y-2">
                  <p>🛒 <strong>How to Order:</strong></p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Select your preferred color and size.</li>
                    <li>Adjust the quantity you need.</li>
                    <li>Click <strong>"Add to Cart"</strong>.</li>
                    <li>Open your Cart and click <strong>"Order on WhatsApp"</strong> to send us your order!</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.data && related.data.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold tracking-tight">You might also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.data.map((rp) => <ProductCard key={rp.id} product={rp} />)}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSizeGuideOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-xl bg-background p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Size Guide</h3>
              <button 
                onClick={() => setSizeGuideOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-md bg-muted hover:bg-muted/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Size</th>
                    <th className="px-4 py-2 font-semibold">Chest (cm)</th>
                    <th className="px-4 py-2 font-semibold">Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-2 font-bold">S</td>
                    <td className="px-4 py-2">48-50</td>
                    <td className="px-4 py-2">68-70</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold">M</td>
                    <td className="px-4 py-2">50-52</td>
                    <td className="px-4 py-2">70-72</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold">L</td>
                    <td className="px-4 py-2">52-54</td>
                    <td className="px-4 py-2">72-74</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold">XL</td>
                    <td className="px-4 py-2">54-56</td>
                    <td className="px-4 py-2">74-76</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold">XXL</td>
                    <td className="px-4 py-2">56-58</td>
                    <td className="px-4 py-2">76-78</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Measurements are approximate and may vary slightly depending on the specific style. If you are between sizes, we recommend sizing up.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
