import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
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
  HelpCircle,
  AlertCircle,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, productOrderLink, generalContactLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/ProductCard";
import { colorToHex } from "@/lib/colors";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store";
import useEmblaCarousel from "embla-carousel-react";
import { toast } from "sonner";
import { resolveImageUrl } from "@/lib/images";

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
      <p className="mt-2 text-xs text-[#6B6B66]">ربما تم تغيير الرابط أو نفد المخزون.</p>
      <Link
        to="/products"
        className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xs bg-[#0D0D0D] px-5 py-2.5 text-xs font-bold text-[#F7F7F5]"
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
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-square bg-white border border-[#E5E5E0]" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-[#E5E5E0]/60" />
            <div className="h-6 w-1/4 bg-[#E5E5E0]/60" />
            <div className="h-28 w-full bg-[#E5E5E0]/60" />
            <div className="h-12 w-full bg-[#E5E5E0]/60" />
          </div>
        </div>
      </div>
    );
  }

  return <ProductView product={productQ.data!} />;
}

function ProductView({ product: p }: { product: Product }) {
  const allImages = [p.main_image, ...(p.gallery_images ?? [])]
    .filter(Boolean)
    .map((src) => resolveImageUrl(src as string));
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
  const [isAdded, setIsAdded] = useState(false);

  // Embla carousel for mobile gestures
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedEmblaIndex, setSelectedEmblaIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedEmblaIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

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

  // Add to cart handler with visual micro-interaction
  const handleAddToCart = () => {
    if (!isReadyToOrder) {
      toast.error("يرجى اختيار المقاس واللون أولاً");
      return;
    }
    addItem(p, qty, selectedSize || undefined, selectedColor || undefined);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
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
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-10 pb-36 md:pb-12 overflow-x-hidden">
      {/* Breadcrumb */}
      <nav className="mb-4 sm:mb-6 flex items-center gap-1.5 text-[11px] text-[#6B6B66]">
        <Link to="/" className="hover:text-[#0D0D0D]">
          الرئيسية
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-[#0D0D0D]">
          الكتالوج
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-[#0D0D0D] font-semibold">{p.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-14">
        {/* Left: Product Imagery */}
        <div className="lg:col-span-7">
          {/* Mobile Swiper with Native App Carousel Gestures */}
          <div className="md:hidden">
            <div className="overflow-hidden border border-[#E5E5E0] bg-white relative" ref={emblaRef}>
              <div className="flex touch-pan-y">
                {allImages.length > 0 ? (
                  allImages.map((src, idx) => (
                    <div className="relative min-w-0 flex-[0_0_100%] aspect-square" key={idx}>
                      <img
                        src={src}
                        alt={`${p.title} - ${idx + 1}`}
                        loading={idx === 0 ? "eager" : "lazy"}
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = "/brand/hero-cairo-streetwear.jpg";
                        }}
                        className="h-full w-full object-contain p-4"
                      />
                    </div>
                  ))
                ) : (
                  <div className="grid aspect-square w-full place-items-center text-[#6B6B66]">
                    لا توجد صورة
                  </div>
                )}
              </div>

              {/* Mobile Slide Badge */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-3 bg-black/75 px-2 py-0.5 text-[10px] font-mono text-white">
                  {selectedEmblaIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Pagination Dots for Mobile */}
            {allImages.length > 1 && (
              <div className="mt-2.5 flex items-center justify-center gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === selectedEmblaIndex ? "w-6 bg-[#0D0D0D]" : "w-1.5 bg-[#E5E5E0]"
                    }`}
                    aria-label={`انتقل للصورة ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Main Image with Crossfade */}
          <div className="relative hidden aspect-square overflow-hidden border border-[#E5E5E0] bg-white md:block">
            {allImages[activeImg] ? (
              <img
                key={activeImg}
                src={allImages[activeImg]}
                alt={p.title}
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = "/brand/hero-cairo-streetwear.jpg";
                }}
                className="h-full w-full object-contain p-8 animate-in fade-in duration-300"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-[#6B6B66]">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center bg-white text-[#0D0D0D] border border-[#E5E5E0] hover:bg-[#F7F7F5]"
                  aria-label="الصورة السابقة"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImg((prev) => (prev + 1) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center bg-white text-[#0D0D0D] border border-[#E5E5E0] hover:bg-[#F7F7F5]"
                  aria-label="الصورة التالية"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              {hasSale && (
                <span className="rounded-xs bg-[#8B2E2E] px-2.5 py-1 text-[11px] font-bold text-white uppercase">
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
                  className={`aspect-square overflow-hidden border bg-white transition-all ${
                    i === activeImg
                      ? "border-[#0D0D0D]"
                      : "border-[#E5E5E0] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Controls */}
        <div className="flex flex-col lg:col-span-5">
          {/* Header & Availability */}
          <div className="border-b border-[#E5E5E0] pb-4">
            <div className="flex items-center justify-between text-[11px] text-[#6B6B66]">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                متوفر للشحن الفوري
              </span>
              {p.product_code && (
                <span className="font-mono">كود: {p.product_code}</span>
              )}
            </div>

            <h1 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-[#0D0D0D]">
              {p.title}
            </h1>

            {/* 3. Rating & Metadata */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-amber-600 font-bold bg-amber-500/10 px-2 py-0.5 rounded-xs">
                <span>★ 4.9</span>
                <span className="text-[#6B6B66] font-normal text-[11px]">(128 تقييم)</span>
              </div>
              <span className="text-[#6B6B66]">•</span>
              <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-600/10 px-2 py-0.5 rounded-xs">
                قطن مصري 100%
              </span>
              <span className="text-[#6B6B66]">•</span>
              <span className="text-[#6B6B66] text-[11px]">أزياء كاجوال</span>
            </div>

            {p.short_description && (
              <p className="mt-2 text-xs leading-relaxed text-[#6B6B66]">
                {p.short_description}
              </p>
            )}

            {/* 4. Price Area */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="price-display text-2xl sm:text-3xl font-black text-[#0D0D0D]">
                {formatPrice(p.price)}
              </span>
              {hasSale && (
                <>
                  <span className="price-display text-sm text-[#6B6B66] line-through">
                    {formatPrice(p.original_price!)}
                  </span>
                  <span className="text-xs font-bold text-[#8B2E2E]">
                    وفر {formatPrice(savings)} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Touch-Friendly Variant Selection */}
          <div className="py-4 space-y-4 border-b border-[#E5E5E0]">
            {/* 5. Color Selection */}
            {needsColor && (
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0D0D0D]">اللون:</span>
                  <span className="text-[#6B6B66]">
                    {selectedColor ? (
                      <strong className="text-[#0D0D0D]">{selectedColor}</strong>
                    ) : (
                      "حدد اللون"
                    )}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {p.colors.map((c) => {
                    const isSelected = c === selectedColor;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`flex min-h-[44px] items-center gap-2 rounded-xs border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? "border-[#0D0D0D] bg-[#0D0D0D] text-[#F7F7F5]"
                            : "border-[#E5E5E0] bg-white text-[#0D0D0D] hover:border-[#0D0D0D]"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: colorToHex(c) }}
                        />
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Size Selection with 44px+ touch targets */}
            {needsSize && (
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0D0D0D]">المقاس:</span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="inline-flex min-h-[40px] items-center gap-1 text-[#0D0D0D] underline font-semibold hover:text-[#6B6B66]"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    <span>جدول المقاسات</span>
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {p.sizes.map((s) => {
                    const isSelected = s === selectedSize;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[3.5rem] h-11 rounded-xs border font-mono text-xs font-bold transition-all ${
                          isSelected
                            ? "border-[#0D0D0D] bg-[#0D0D0D] text-[#F7F7F5]"
                            : "border-[#E5E5E0] bg-white text-[#0D0D0D] hover:border-[#0D0D0D]"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. Quantity Controls */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0D0D0D]">الكمية:</span>
              <div className="flex items-center border border-[#E5E5E0] bg-white">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-11 w-11 place-items-center text-[#6B6B66] hover:text-[#0D0D0D]"
                  aria-label="تقليل الكمية"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-mono text-xs font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="grid h-11 w-11 place-items-center text-[#6B6B66] hover:text-[#0D0D0D]"
                  aria-label="زيادة الكمية"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Validation Notice */}
          {!isReadyToOrder && (
            <div className="my-2.5 flex items-center gap-2 text-xs text-[#8B2E2E] font-medium">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>يرجى اختيار المقاس واللون للمتابعة.</span>
            </div>
          )}

          {/* 8. Purchase Actions (In-page on both Mobile & Desktop) */}
          <div className="mt-4 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleDirectWhatsAppOrder}
              disabled={!isReadyToOrder}
              className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xs text-xs font-bold transition-colors ${
                isReadyToOrder
                  ? "bg-[#0D0D0D] text-[#F7F7F5] hover:bg-[#1F1F1F] active:scale-98"
                  : "bg-[#E5E5E0] text-[#6B6B66] cursor-not-allowed"
              }`}
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>اطلب الآن عبر واتساب (دفع كاش عند الاستلام)</span>
            </button>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isReadyToOrder}
                className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xs border text-xs font-semibold transition-all duration-200 active:scale-98 ${
                  isAdded
                    ? "border-[#1F1F1F] bg-[#1F1F1F] text-emerald-400"
                    : isReadyToOrder
                    ? "border-[#0D0D0D] bg-white text-[#0D0D0D] hover:bg-[#F7F7F5]"
                    : "border-[#E5E5E0] bg-white text-[#6B6B66] cursor-not-allowed"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>تمت الإضافة ✓</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>أضف إلى السلة</span>
                  </>
                )}
              </button>

              <a
                href={generalContactLink(`مرحباً PR1ME، لدي استفسار عن: ${p.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xs border border-[#E5E5E0] bg-white px-4 text-xs font-semibold text-[#6B6B66] hover:text-[#0D0D0D]"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>استفسار</span>
              </a>
            </div>
          </div>

          {/* 9. Shipping Information & Guarantees Box */}
          <div className="mt-5 border-t border-[#E5E5E0] pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#6B6B66]">
            <div className="flex items-center gap-2 border border-[#E5E5E0] p-2.5 bg-white">
              <ShieldCheck className="h-4 w-4 text-[#0D0D0D] flex-shrink-0" />
              <span>معاينة وقياس قبل الدفع</span>
            </div>
            <div className="flex items-center gap-2 border border-[#E5E5E0] p-2.5 bg-white">
              <Truck className="h-4 w-4 text-[#0D0D0D] flex-shrink-0" />
              <span>شحن 2-4 أيام للمحافظات</span>
            </div>
            <div className="flex items-center gap-2 border border-[#E5E5E0] p-2.5 bg-white">
              <RotateCcw className="h-4 w-4 text-[#0D0D0D] flex-shrink-0" />
              <span>استبدال مقاس خلال 14 يوم</span>
            </div>
          </div>

          {/* 10 & 11. Description & Specifications Tabs */}
          <div className="mt-6 border-t border-[#E5E5E0] pt-4">
            <div className="flex gap-4 border-b border-[#E5E5E0] pb-2 text-xs font-bold touch-scroll overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`pb-2 transition-colors border-b-2 -mb-2.5 whitespace-nowrap min-h-[36px] ${
                  activeTab === "details"
                    ? "border-[#0D0D0D] text-[#0D0D0D]"
                    : "border-transparent text-[#6B6B66]"
                }`}
              >
                10. تفاصيل القطعة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shipping")}
                className={`pb-2 transition-colors border-b-2 -mb-2.5 whitespace-nowrap min-h-[36px] ${
                  activeTab === "shipping"
                    ? "border-[#0D0D0D] text-[#0D0D0D]"
                    : "border-transparent text-[#6B6B66]"
                }`}
              >
                11. المواصفات والخامة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                className={`pb-2 transition-colors border-b-2 -mb-2.5 whitespace-nowrap min-h-[36px] ${
                  activeTab === "guide"
                    ? "border-[#0D0D0D] text-[#0D0D0D]"
                    : "border-transparent text-[#6B6B66]"
                }`}
              >
                الشحن والاستبدال
              </button>
            </div>

            <div className="mt-3 text-xs leading-relaxed text-[#6B6B66]">
              {activeTab === "details" && (
                <div className="space-y-2">
                  <p>{p.description || p.short_description || "قطعة كاجوال راقية من PR1ME بخامات قطنية عالية الجودة مصممة للاستخدام اليومي المستوحى من أزياء الشارع."}</p>
                  <ul className="list-disc pr-4 space-y-1 text-[#6B6B66]">
                    <li>100% قطن مصري فاخر معالج ضد الانكماش.</li>
                    <li>ثبات عالي للألوان مع الغسيل المتكرر.</li>
                    <li>قَصّة كاجوال مريحة تمنحك حرية الحركة.</li>
                  </ul>
                </div>
              )}
              {activeTab === "shipping" && (
                <div className="space-y-2 border border-[#E5E5E0] p-3 bg-[#F7F7F5]">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="font-bold text-[#0D0D0D]">الخامة:</span>
                      <p>100% قطن مصري ممتاز</p>
                    </div>
                    <div>
                      <span className="font-bold text-[#0D0D0D]">القَصّة:</span>
                      <p>Relaxed Fit كاجوال</p>
                    </div>
                    <div>
                      <span className="font-bold text-[#0D0D0D]">تعليمات الغسيل:</span>
                      <p>غسيل بارد 30° مئوية</p>
                    </div>
                    <div>
                      <span className="font-bold text-[#0D0D0D]">بلد الصنع:</span>
                      <p>صُنع في مصر</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "guide" && (
                <div className="space-y-2">
                  <p>🚚 <strong>مدة الشحن:</strong> التوصيل يتم خلال 2 إلى 4 أيام عمل لجميع أنحاء مصر.</p>
                  <p>💵 <strong>الدفع والمعاينة:</strong> كاش عند الاستلام مع حق فتح الشحنة وقياس القطعة قبل الدفع.</p>
                  <p>🔄 <strong>تبديل المقاس:</strong> متاح مجاناً خلال 14 يوماً من استلام الشحنة.</p>
                </div>
              )}
            </div>
          </div>

          {/* 12. Customer Reviews Section */}
          <div className="mt-8 border-t border-[#E5E5E0] pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                12. آراء وتجارب العملاء
              </h3>
              <span className="text-[11px] text-amber-600 font-bold">★ 4.9 من 5</span>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="border border-[#E5E5E0] bg-white p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0D0D0D]">كريم م. — القاهرة</span>
                  <span className="text-[10px] text-amber-500 font-mono">★★★★★</span>
                </div>
                <p className="mt-1 text-[11px] text-[#6B6B66] leading-relaxed">
                  "الخامة ممتازة بجد ومطابقة للصور، والمندوب استنى لحد ما قست المقاس واتأكدت منه. تجربة ممتازة!"
                </p>
              </div>

              <div className="border border-[#E5E5E0] bg-white p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0D0D0D]">عمر س. — الإسكندرية</span>
                  <span className="text-[10px] text-amber-500 font-mono">★★★★★</span>
                </div>
                <p className="mt-1 text-[11px] text-[#6B6B66] leading-relaxed">
                  "التقفيل نضيف جداً وثبات اللون بعد أول غسلة ممتاز. هكرر الطلب في الكوليكشن الجديد أكيد."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar on Mobile with Safe-Area Inset */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-[#E5E5E0] bg-white p-2.5 sm:p-3 pb-safe md:hidden shadow-xl">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[10px] text-[#6B6B66] truncate font-medium">
              {selectedSize ? `مقاس: ${selectedSize}` : "حدد المقاس"}
            </span>
            <span className="price-display text-sm font-black text-[#0D0D0D]">
              {formatPrice(p.price * qty)}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isReadyToOrder}
              className={`h-11 px-3.5 border text-xs font-bold transition-all duration-200 active:scale-95 ${
                isAdded
                  ? "border-[#1F1F1F] bg-[#1F1F1F] text-emerald-400"
                  : isReadyToOrder
                  ? "border-[#0D0D0D] bg-[#F7F7F5] text-[#0D0D0D]"
                  : "border-[#E5E5E0] bg-white text-[#6B6B66] opacity-60"
              }`}
            >
              {isAdded ? "تمت الإضافة ✓" : "السلة"}
            </button>
            <button
              type="button"
              onClick={handleDirectWhatsAppOrder}
              disabled={!isReadyToOrder}
              className={`h-11 flex-1 max-w-[190px] flex items-center justify-center gap-1 text-xs font-bold transition-colors ${
                isReadyToOrder
                  ? "bg-[#0D0D0D] text-[#F7F7F5] active:scale-95"
                  : "bg-[#E5E5E0] text-[#6B6B66] opacity-60"
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>اطلب على واتساب</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.data && related.data.length > 0 && (
        <section className="mt-12 sm:mt-16 border-t border-[#E5E5E0] pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-[#0D0D0D]">
              قطع قد تعجبك أيضاً
            </h2>
            <Link
              to="/products"
              className="text-xs font-semibold text-[#6B6B66] hover:text-[#0D0D0D] flex items-center gap-1"
            >
              <span>مشاهدة الكل</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
            {related.data.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal / Bottom Sheet on Mobile */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setSizeGuideOpen(false)}
          />
          <div className="relative w-full max-h-[85dvh] sm:max-w-lg border-t sm:border border-[#E5E5E0] bg-white p-4 sm:p-6 shadow-2xl overflow-y-auto pb-safe animate-in slide-in-from-bottom-5 sm:animate-in sm:zoom-in-95 duration-150">
            <div className="mb-3 flex items-center justify-between border-b border-[#E5E5E0] pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[#0D0D0D]" />
                <h3 className="text-sm font-bold text-[#0D0D0D]">جدول مقاسات وأوزان PR1ME</h3>
              </div>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="grid h-8 w-8 place-items-center text-[#6B6B66] hover:text-[#0D0D0D]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sizing Table */}
            <div className="overflow-x-auto border border-[#E5E5E0]">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F7F7F5] text-[#6B6B66] font-semibold">
                  <tr>
                    <th className="px-3 py-2">المقاس</th>
                    <th className="px-3 py-2">الوزن</th>
                    <th className="px-3 py-2">عرض الصدر</th>
                    <th className="px-3 py-2">الطول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E0]">
                  <tr>
                    <td className="px-3 py-2 font-mono font-bold text-[#0D0D0D]">S</td>
                    <td className="px-3 py-2">50 - 62 كجم</td>
                    <td className="px-3 py-2 font-mono">48 - 50 سم</td>
                    <td className="px-3 py-2 font-mono">68 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-bold text-[#0D0D0D]">M</td>
                    <td className="px-3 py-2">63 - 74 كجم</td>
                    <td className="px-3 py-2 font-mono">51 - 53 سم</td>
                    <td className="px-3 py-2 font-mono">70 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-bold text-[#0D0D0D]">L</td>
                    <td className="px-3 py-2">75 - 85 كجم</td>
                    <td className="px-3 py-2 font-mono">54 - 56 سم</td>
                    <td className="px-3 py-2 font-mono">72 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-bold text-[#0D0D0D]">XL</td>
                    <td className="px-3 py-2">86 - 97 كجم</td>
                    <td className="px-3 py-2 font-mono">57 - 59 سم</td>
                    <td className="px-3 py-2 font-mono">74 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-bold text-[#0D0D0D]">XXL</td>
                    <td className="px-3 py-2">98 - 110 كجم</td>
                    <td className="px-3 py-2 font-mono">60 - 63 سم</td>
                    <td className="px-3 py-2 font-mono">76 سم</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3.5 border border-[#E5E5E0] p-3 text-xs bg-[#F7F7F5]">
              <span className="font-bold text-[#0D0D0D]">نصيحة المقاس:</span>
              <p className="mt-1 text-[#6B6B66] leading-relaxed">
                إذا كنت تفضل اللوك الواسع (Oversized)، اختر مقاساً أكبر بدرجة. المندوب سينتظرك لتجربة القطعة قبل الدفع!
              </p>
              <a
                href={generalContactLink("مرحباً PR1ME، أود استشارة بخصوص اختيار المقاس")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-semibold text-[#0D0D0D] underline"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>استشر خبير المقاسات على واتساب</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
