import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  MessageCircle,
  ChevronLeft,
  Minus,
  Plus,
  ChevronRight,
  X,
  Ruler,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Check,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, productOrderLink, generalContactLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/ProductCard";
import { colorToHex } from "@/lib/colors";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store";
import useEmblaCarousel from "embla-carousel-react";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params: { slug } }) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return { product: data as Product | null };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "المنتج غير متوفر — PR1ME" }] };
    return {
      meta: [
        { title: `${p.title} — PR1ME` },
        { name: "description", content: p.short_description || p.title },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.short_description || p.title },
        { property: "og:image", content: p.main_image || "" },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">عفواً، هذا المنتج غير متوفر حالياً</h1>
      <p className="mt-2 text-xs text-muted-foreground">ربما تم تغيير الرابط أو نفد المخزون.</p>
      <Link
        to="/products"
        className="mt-6 inline-flex items-center gap-2 rounded-xs bg-foreground px-5 py-2.5 text-xs font-bold text-background"
      >
        <span>العودة لكتالوج المنتجات</span>
        <ChevronLeft className="h-4 w-4" />
      </Link>
    </div>
  ),
});

function ProductDetailPage() {
  const { slug } = Route.useParams();

  const productQ = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as Product;
    },
  });

  if (productQ.isLoading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[4/5] bg-muted/40 border border-border" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-muted/40" />
            <div className="h-6 w-1/4 bg-muted/40" />
            <div className="h-28 w-full bg-muted/40" />
            <div className="h-12 w-full bg-muted/40" />
          </div>
        </div>
      </div>
    );
  }

  return <ProductView product={productQ.data!} />;
}

function ProductView({ product: p }: { product: Product }) {
  const allImages = [p.main_image, ...(p.gallery_images ?? [])].filter(Boolean) as string[];
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    p.colors?.length === 1 ? p.colors[0] : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    p.sizes?.length === 1 ? p.sizes[0] : null
  );
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "guide">("details");
  const [isSizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [emblaRef] = useEmblaCarousel({ loop: true });

  const addItem = useCartStore((s) => s.addItem);

  const needsColor = (p.colors?.length ?? 0) > 0;
  const needsSize = (p.sizes?.length ?? 0) > 0;
  const isReadyToOrder = (!needsColor || !!selectedColor) && (!needsSize || !!selectedSize) && qty > 0;

  // Discount calculations
  const hasSale = p.original_price && p.original_price > p.price;
  const savings = hasSale ? p.original_price! - p.price : 0;
  const discountPercent = hasSale
    ? Math.round((savings / p.original_price!) * 100)
    : 0;

  // Add to cart handler
  const handleAddToCart = () => {
    if (!isReadyToOrder) {
      toast.error("يرجى اختيار المقاس واللون أولاً");
      return;
    }
    addItem(p, qty, selectedSize || undefined, selectedColor || undefined);
    toast.success(`تمت إضافة "${p.title}" إلى السلة`);
  };

  // Direct WhatsApp order link
  const handleDirectWhatsAppOrder = () => {
    if (!isReadyToOrder) {
      toast.error("يرجى تحديد المقاس واللون أولاً لإتمام طلبك عبر واتساب");
      return;
    }

    const currentUrl = typeof window !== "undefined" ? window.location.href : undefined;
    const url = productOrderLink({
      title: p.title,
      code: p.product_code,
      price: p.price,
      url: currentUrl,
      items: [
        {
          color: selectedColor,
          size: selectedSize,
          quantity: qty,
        },
      ],
    });
    window.open(url, "_blank");
  };

  const related = useQuery({
    queryKey: ["related", p.category_id, p.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .neq("id", p.id)
        .limit(8);
      if (error) throw error;

      const sameCategory = data.filter((x) => p.category_id && x.category_id === p.category_id);
      const otherCategory = data.filter((x) => !p.category_id || x.category_id !== p.category_id);

      return [...sameCategory, ...otherCategory].slice(0, 4) as Product[];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          الرئيسية
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-foreground">
          الكتالوج
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-foreground font-semibold">{p.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left: Product Imagery */}
        <div className="lg:col-span-7">
          {/* Mobile Swiper */}
          <div className="overflow-hidden border border-border bg-muted md:hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {allImages.length > 0 ? (
                allImages.map((src, idx) => (
                  <div className="relative min-w-0 flex-[0_0_100%] aspect-[4/5]" key={idx}>
                    <img
                      src={src}
                      alt={`${p.title} - ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white">
                      {idx + 1} / {allImages.length}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid aspect-[4/5] w-full place-items-center text-muted-foreground">
                  لا توجد صورة
                </div>
              )}
            </div>
          </div>

          {/* Desktop Main Image */}
          <div className="relative hidden aspect-[4/5] overflow-hidden border border-border bg-muted md:block">
            {allImages[activeImg] ? (
              <img
                src={allImages[activeImg]}
                alt={p.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-muted-foreground">
                لا توجد صورة
              </div>
            )}

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImg((prev) => (prev - 1 + allImages.length) % allImages.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center bg-background/90 text-foreground border border-border transition-colors hover:bg-background"
                  aria-label="الصورة السابقة"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImg((prev) => (prev + 1) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center bg-background/90 text-foreground border border-border transition-colors hover:bg-background"
                  aria-label="الصورة التالية"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              {hasSale && (
                <span className="rounded-xs bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white uppercase">
                  خصم {discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Desktop Thumbnails */}
          {allImages.length > 1 && (
            <div className="mt-3 hidden grid-cols-6 gap-2.5 md:grid">
              {allImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden border transition-all ${
                    i === activeImg
                      ? "border-foreground"
                      : "border-border opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Controls */}
        <div className="flex flex-col lg:col-span-5">
          {/* Header & Code */}
          <div className="border-b border-border pb-5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                متوفر للشحن الفوري
              </span>
              {p.product_code && (
                <span className="font-mono">كود: {p.product_code}</span>
              )}
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {p.title}
            </h1>

            {p.short_description && (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {p.short_description}
              </p>
            )}

            {/* Price Area */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="price-display text-3xl font-black text-foreground">
                {formatPrice(p.price)}
              </span>
              {hasSale && (
                <>
                  <span className="price-display text-sm text-muted-foreground line-through">
                    {formatPrice(p.original_price!)}
                  </span>
                  <span className="text-xs font-bold text-red-500">
                    وفر {formatPrice(savings)} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Selection Area */}
          <div className="py-6 space-y-6 border-b border-border">
            {/* Color Selection */}
            {needsColor && (
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">اللون:</span>
                  <span className="text-muted-foreground">
                    {selectedColor ? (
                      <strong className="text-foreground">{selectedColor}</strong>
                    ) : (
                      "حدد اللون"
                    )}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  {p.colors.map((c) => {
                    const isSelected = c === selectedColor;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`flex items-center gap-2 rounded-xs border px-3 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card text-foreground hover:border-zinc-500"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-black/30"
                          style={{ backgroundColor: colorToHex(c) }}
                        />
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {needsSize && (
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">المقاس:</span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    <span>جدول المقاسات والأوزان</span>
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  {p.sizes.map((s) => {
                    const isSelected = s === selectedSize;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[3rem] h-10 rounded-xs border font-mono text-xs font-bold transition-all ${
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card text-foreground hover:border-zinc-500"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">الكمية:</span>
              <div className="flex items-center border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                  aria-label="تقليل الكمية"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center font-mono text-xs font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                  aria-label="زيادة الكمية"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Validation Notice */}
          {!isReadyToOrder && (
            <div className="my-3 flex items-center gap-2 text-xs text-amber-400 font-medium">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>يرجى اختيار المقاس واللون لمتابعة الطلب.</span>
            </div>
          )}

          {/* Purchase Actions */}
          <div className="mt-5 flex flex-col gap-2.5 pb-20 md:pb-0">
            {/* Direct WhatsApp Order CTA */}
            <button
              type="button"
              onClick={handleDirectWhatsAppOrder}
              disabled={!isReadyToOrder}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-xs text-xs font-bold transition-colors ${
                isReadyToOrder
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-50"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>اطلب الآن عبر واتساب (دفع كاش عند الاستلام)</span>
            </button>

            <div className="flex gap-2.5">
              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isReadyToOrder}
                className={`flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xs border text-xs font-semibold transition-colors ${
                  isReadyToOrder
                    ? "border-foreground bg-foreground text-background hover:bg-zinc-200"
                    : "border-border bg-card text-muted-foreground cursor-not-allowed opacity-50"
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>أضف إلى السلة</span>
              </button>

              {/* Inquiry */}
              <a
                href={generalContactLink(`مرحباً PR1ME، لدي استفسار عن الموديل: ${p.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-1.5 rounded-xs border border-border bg-card px-4 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>استفسار</span>
              </a>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="mt-6 border-t border-border pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2 border border-border p-2.5 bg-card/40">
              <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>معاينة وقياس قبل الدفع</span>
            </div>
            <div className="flex items-center gap-2 border border-border p-2.5 bg-card/40">
              <Truck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>شحن 2-4 أيام لجميع المحافظات</span>
            </div>
            <div className="flex items-center gap-2 border border-border p-2.5 bg-card/40">
              <RotateCcw className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>استبدال المقاس خلال 14 يوم</span>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="flex gap-6 border-b border-border pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`pb-2 transition-colors border-b-2 -mb-2.5 ${
                  activeTab === "details"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                تفاصيل القطعة والخامة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shipping")}
                className={`pb-2 transition-colors border-b-2 -mb-2.5 ${
                  activeTab === "shipping"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                الشحن والمعاينة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                className={`pb-2 transition-colors border-b-2 -mb-2.5 ${
                  activeTab === "guide"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                سياسة الاستبدال
              </button>
            </div>

            <div className="mt-4 text-xs leading-relaxed text-muted-foreground min-h-[90px]">
              {activeTab === "details" && (
                <div className="space-y-2">
                  <p>{p.description || p.short_description || "قطعة كاجوال راقية من PR1ME بخامات قطنية عالية الجودة مصممة للاستخدام اليومي."}</p>
                  <ul className="list-disc pr-4 space-y-1 text-muted-foreground">
                    <li>100% قطن مصري ناعم ومعالج ضد الانكماش.</li>
                    <li>ثبات عالي للألوان مع الغسيل المتكرر.</li>
                    <li>قَصّة كاجوال عملية مريحة للجسم.</li>
                  </ul>
                </div>
              )}
              {activeTab === "shipping" && (
                <div className="space-y-2">
                  <p>🚚 <strong>مدة الشحن:</strong> التوصيل يتم خلال 2 إلى 4 أيام عمل لجميع أنحاء مصر.</p>
                  <p>💵 <strong>الدفع:</strong> كاش عند الاستلام. يحق لك فحص القطعة وقياسها قبل الدفع للمندوب.</p>
                  <p>📦 <strong>الشحن المجاني:</strong> متاح تلقائياً للطلبات التي تزيد قيمتها عن 1,000 ج.م.</p>
                </div>
              )}
              {activeTab === "guide" && (
                <div className="space-y-2">
                  <p>🔄 <strong>تبديل المقاس:</strong> إذا كان المقاس غير مناسب بعد الاستلام، تواصل معنا خلال 14 يوماً وسيصلك المندوب بالمقاس البديل.</p>
                  <p>✨ <strong>شروط الاستبدال:</strong> الحفاظ على التيكت والحالة الأصلية للمنتج.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">
              {selectedSize ? `مقاس ${selectedSize}` : "حدد المقاس"}
            </span>
            <span className="price-display text-sm font-black text-foreground">
              {formatPrice(p.price * qty)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isReadyToOrder}
              className={`h-10 px-3 rounded-xs border text-xs font-semibold ${
                isReadyToOrder
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground opacity-50"
              }`}
            >
              السلة
            </button>
            <button
              type="button"
              onClick={handleDirectWhatsAppOrder}
              disabled={!isReadyToOrder}
              className={`h-10 px-4 rounded-xs text-xs font-bold ${
                isReadyToOrder
                  ? "bg-emerald-600 text-white"
                  : "bg-muted text-muted-foreground border border-border opacity-50"
              }`}
            >
              طلب على واتساب
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.data && related.data.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">
              قطع قد تعجبك أيضاً
            </h2>
            <Link
              to="/products"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <span>مشاهدة الكل</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {related.data.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal (Retail Chart) */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setSizeGuideOpen(false)}
          />
          <div className="relative w-full max-w-lg border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground">جدول مقاسات وأوزان PR1ME</h3>
              </div>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="grid h-7 w-7 place-items-center border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sizing Table */}
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-right text-xs">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-3 py-2">المقاس</th>
                    <th className="px-3 py-2">الوزن التقريبي</th>
                    <th className="px-3 py-2">عرض الصدر</th>
                    <th className="px-3 py-2">الطول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-3 py-2 font-mono font-bold text-foreground">S</td>
                    <td className="px-3 py-2">50 - 62 كجم</td>
                    <td className="px-3 py-2 font-mono">48 - 50 سم</td>
                    <td className="px-3 py-2 font-mono">68 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-bold text-foreground">M</td>
                    <td className="px-3 py-2">63 - 74 كجم</td>
                    <td className="px-3 py-2 font-mono">51 - 53 سم</td>
                    <td className="px-3 py-2 font-mono">70 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-bold text-foreground">L</td>
                    <td className="px-3 py-2">75 - 85 كجم</td>
                    <td className="px-3 py-2 font-mono">54 - 56 سم</td>
                    <td className="px-3 py-2 font-mono">72 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-bold text-foreground">XL</td>
                    <td className="px-3 py-2">86 - 97 كجم</td>
                    <td className="px-3 py-2 font-mono">57 - 59 سم</td>
                    <td className="px-3 py-2 font-mono">74 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-bold text-foreground">XXL</td>
                    <td className="px-3 py-2">98 - 110 كجم</td>
                    <td className="px-3 py-2 font-mono">60 - 63 سم</td>
                    <td className="px-3 py-2 font-mono">76 سم</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 border border-border p-3 text-xs bg-background">
              <span className="font-bold text-foreground">نصيحة المقاس:</span>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                إذا كنت تفضل اللوك الواسع (Oversized)، ننصح باختيار مقاس أكبر من مقاسك المعتاد بدرجة واحدة.
              </p>
              <a
                href={generalContactLink("مرحباً PR1ME، أود استشارة بخصوص اختيار المقاس")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-400 hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>تحدث مع خبير المقاسات على واتساب</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
