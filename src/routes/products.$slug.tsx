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
  RefreshCw,
  ShoppingBag,
  Sparkles,
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
    if (!p) return { meta: [{ title: "المنتج غير موجود — PR1ME" }] };
    return {
      meta: [
        { title: `${p.title} | PR1ME` },
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
      <h1 className="text-3xl font-black">عفواً، هذا المنتج غير متوفر حالياً</h1>
      <p className="mt-2 text-sm text-muted-foreground">ربما تم تغيير الرابط أو نفد المخزون.</p>
      <Link
        to="/products"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background"
      >
        <span>العودة للمتجر والكتالوج</span>
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
          <div className="aspect-[4/5] rounded-2xl bg-muted/40" />
          <div className="space-y-4">
            <div className="h-9 w-3/4 rounded-xl bg-muted/40" />
            <div className="h-6 w-1/3 rounded-lg bg-muted/40" />
            <div className="h-32 w-full rounded-xl bg-muted/40" />
            <div className="h-12 w-full rounded-xl bg-muted/40" />
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
  const setCartOpen = useCartStore((s) => s.setCartOpen);

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
      toast.error("يرجى اختيار اللون والمقاس أولاً لإضافة المنتج للسلة");
      return;
    }
    addItem(p, qty, selectedSize || undefined, selectedColor || undefined);
    toast.success(`تمت إضافة "${p.title}" إلى سلة المشتريات`);
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          الرئيسية
        </Link>
        <span>/</span>
        <Link to="/products" className="transition-colors hover:text-foreground">
          المتجر
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-foreground font-bold">{p.title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left: Gallery Area */}
        <div className="space-y-3.5 lg:col-span-6">
          {/* Mobile Swiper */}
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/30 md:hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {allImages.length > 0 ? (
                allImages.map((src, idx) => (
                  <div className="relative min-w-0 flex-[0_0_100%] aspect-[4/5]" key={idx}>
                    <img
                      src={src}
                      alt={`${p.title} - ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
                      {idx + 1} من {allImages.length}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid aspect-[4/5] w-full place-items-center text-muted-foreground">
                  لا توجد صور
                </div>
              )}
            </div>
          </div>

          {/* Desktop Main Image Display */}
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-3xl border border-border/60 bg-muted/30 group/img md:block shadow-lg">
            {allImages[activeImg] ? (
              <img
                src={allImages[activeImg]}
                alt={p.title}
                className="h-full w-full object-cover transition-all duration-500 hover:scale-105"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground border border-border/80 shadow-lg backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
                  aria-label="الصورة السابقة"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImg((prev) => (prev + 1) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground border border-border/80 shadow-lg backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
                  aria-label="الصورة التالية"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Badges on desktop image */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {hasSale && (
                <span className="rounded-full bg-sale px-3 py-1 text-xs font-black uppercase text-white shadow-lg">
                  خصم {discountPercent}%
                </span>
              )}
              {p.is_featured && (
                <span className="flex items-center gap-1.5 rounded-full badge-gold px-3 py-1 text-xs font-bold shadow-lg">
                  <Sparkles className="h-3.5 w-3.5" /> قطعة مميزة
                </span>
              )}
            </div>
          </div>

          {/* Desktop Thumbnails Row */}
          {allImages.length > 1 && (
            <div className="hidden grid-cols-5 gap-3 md:grid">
              {allImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    i === activeImg
                      ? "border-foreground ring-2 ring-foreground/20 scale-102"
                      : "border-border/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Guided Options */}
        <div className="flex flex-col lg:col-span-6">
          {/* Header & Product Code */}
          <div className="border-b border-border/50 pb-5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-whatsapp/15 px-3 py-1 text-xs font-bold text-whatsapp">
                <span className="h-2 w-2 rounded-full bg-whatsapp pulse-dot" />
                متوفر في المخزن وجاهز للشحن فوراً
              </span>
              {p.product_code && (
                <span className="text-xs font-mono text-muted-foreground">كود: {p.product_code}</span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {p.title}
            </h1>

            {p.short_description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {p.short_description}
              </p>
            )}

            {/* Pricing Area */}
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black text-foreground">{formatPrice(p.price)}</span>
              {hasSale && (
                <>
                  <span className="text-base text-muted-foreground line-through font-semibold">
                    {formatPrice(p.original_price!)}
                  </span>
                  <span className="rounded-lg bg-sale/20 px-2.5 py-0.5 text-xs font-extrabold text-sale">
                    وفر {formatPrice(savings)} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Guided Step-by-Step Selection Box */}
          <div className="my-6 rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm space-y-6 shadow-xs">
            {/* Step 1: Color Selection */}
            {needsColor && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-background text-xs font-black">
                      1
                    </span>
                    <span className="text-sm font-bold text-foreground">اختر اللون:</span>
                  </div>
                  <span className="text-xs font-bold text-whatsapp">
                    {selectedColor ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        تم اختيار: {selectedColor}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">اضغط على لون لاختياره</span>
                    )}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2.5">
                  {p.colors.map((c) => {
                    const isSelected = c === selectedColor;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                          isSelected
                            ? "border-foreground bg-foreground text-background shadow-md scale-102"
                            : "border-border/80 bg-muted/40 text-foreground hover:border-foreground/50 hover:bg-muted"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: colorToHex(c) }}
                        />
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Size Selection & Size Guide */}
            {needsSize && (
              <div className="border-t border-border/50 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-background text-xs font-black">
                      {needsColor ? 2 : 1}
                    </span>
                    <span className="text-sm font-bold text-foreground">اختر المقاس:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-whatsapp hover:underline"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    <span>جدول المقاسات والأوزان</span>
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2.5">
                  {p.sizes.map((s) => {
                    const isSelected = s === selectedSize;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[3.25rem] rounded-xl border px-4 py-2.5 text-sm font-black transition-all ${
                          isSelected
                            ? "border-foreground bg-foreground text-background shadow-md scale-105"
                            : "border-border/80 bg-muted/40 text-foreground hover:border-foreground/50 hover:bg-muted"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  💡 <strong>نصيحة:</strong> اختر مقاسك المعتاد. يمكنك دائماً معاينة وقياس القطعة بحضور المندوب قبل الدفع!
                </p>
              </div>
            )}

            {/* Step 3: Quantity */}
            <div className="border-t border-border/50 pt-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-background text-xs font-black">
                  {(needsColor ? 1 : 0) + (needsSize ? 1 : 0) + 1}
                </span>
                <span className="text-sm font-bold text-foreground">الكمية المطلوبة:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border/80 bg-muted/40 hover:bg-muted active:scale-95"
                  aria-label="إنقاص الكمية"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-base font-black font-mono">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border/80 bg-muted/40 hover:bg-muted active:scale-95"
                  aria-label="زيادة الكمية"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Validation Hint if not selected */}
          {!isReadyToOrder && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400 font-semibold animate-in fade-in">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                يرجى اختيار {needsColor && !selectedColor ? "اللون" : ""}{" "}
                {needsColor && !selectedColor && needsSize && !selectedSize ? "و" : ""}{" "}
                {needsSize && !selectedSize ? "المقاس" : ""} بالخطوات أعلاه للمتابعة.
              </span>
            </div>
          )}

          {/* Main Action Buttons (Desktop & Tablet) */}
          <div className="flex flex-col gap-3 pb-24 md:pb-0">
            {/* Primary: Direct WhatsApp Order */}
            <button
              type="button"
              onClick={handleDirectWhatsAppOrder}
              disabled={!isReadyToOrder}
              className={`flex h-13 w-full items-center justify-center gap-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-98 ${
                isReadyToOrder
                  ? "bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp-hover shadow-whatsapp/25"
                  : "bg-muted text-muted-foreground border border-border/60 cursor-not-allowed opacity-60"
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span>اطلب هذا الموديل الآن عبر واتساب (دفع عند الاستلام)</span>
            </button>

            <div className="flex gap-3">
              {/* Secondary: Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isReadyToOrder}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-all active:scale-98 ${
                  isReadyToOrder
                    ? "border-foreground bg-foreground text-background hover:bg-foreground/90 shadow-sm"
                    : "border-border/60 bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>أضف للسلة وتصفح المزيد</span>
              </button>

              {/* Instant Inquiry on WhatsApp */}
              <a
                href={generalContactLink(`مرحباً PR1ME، لدي استفسار عن المنتج: ${p.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-muted/40 px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                <HelpCircle className="h-4 w-4 text-whatsapp" />
                <span>اسأل سؤالاً</span>
              </a>
            </div>
          </div>

          {/* 3-Step Ordering Micro-Guide */}
          <div className="mt-8 rounded-2xl border border-border/60 bg-muted/20 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-whatsapp" />
              <span>كيف تتم عملية الشراء والتوصيل؟</span>
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs text-muted-foreground">
              <div className="rounded-xl border border-border/40 bg-card p-3">
                <strong className="block text-foreground mb-1">1. التجهيز</strong>
                اضغط على زر الطلب لتأكيد مقاسك وعنوانك في محادثة واتساب.
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-3">
                <strong className="block text-foreground mb-1">2. الشحن السريع</strong>
                يتم إرسال شحنتك خلال 48 ساعة وتتبع خط سير المندوب.
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-3">
                <strong className="block text-foreground mb-1">3. المعاينة والدفع</strong>
                افتح الشحنة، عاين الخامات وقس المقاس ثم ادفع كاش.
              </div>
            </div>
          </div>

          {/* Reassurance Guarantees Box */}
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 p-3">
              <Truck className="h-4 w-4 text-whatsapp flex-shrink-0" />
              <span>شحن سريع لجميع المحافظات</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 p-3">
              <ShieldCheck className="h-4 w-4 text-whatsapp flex-shrink-0" />
              <span>معاينة قبل الدفع كاش</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 p-3">
              <RefreshCw className="h-4 w-4 text-whatsapp flex-shrink-0" />
              <span>استبدال مقاس خلال 14 يوم</span>
            </div>
          </div>

          {/* Description & Details Tabs */}
          <div className="mt-8 border-t border-border/60 pt-6">
            <div className="flex gap-4 border-b border-border/50 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`text-sm font-bold pb-2 -mb-2.5 transition-colors border-b-2 ${
                  activeTab === "details"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                تفاصيل وخامة المنتج
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shipping")}
                className={`text-sm font-bold pb-2 -mb-2.5 transition-colors border-b-2 ${
                  activeTab === "shipping"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                الشحن والتوصيل
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                className={`text-sm font-bold pb-2 -mb-2.5 transition-colors border-b-2 ${
                  activeTab === "guide"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                سياسة الاستبدال
              </button>
            </div>

            <div className="mt-4 text-sm leading-relaxed text-muted-foreground min-h-[90px]">
              {activeTab === "details" && (
                <div className="space-y-2 whitespace-pre-line">
                  {p.description || p.short_description || "قطعة كاجوال راقية مصممة بعناية من خامات قطنية متينة وعالية النعومة."}
                  <ul className="mt-3 list-disc pr-5 space-y-1 text-xs">
                    <li>أقمشة قطنية معالجة ضد الانكماش وبهتان الألوان.</li>
                    <li>خياطة مدعمة لتحمل الاستخدام والغسيل المتكرر.</li>
                    <li>قَصّة كاجوال عصرية مريحة جداً للجسم.</li>
                  </ul>
                </div>
              )}
              {activeTab === "shipping" && (
                <div className="space-y-2 text-xs leading-relaxed">
                  <p>🚚 <strong>مدة الشحن:</strong> التوصيل يتم خلال 2 إلى 4 أيام عمل لكافة محافظات مصر.</p>
                  <p>💵 <strong>طريقة الدفع:</strong> كاش عند الاستلام. يحق لك فتح الباكدج والتأكد من المقاس والخامة قبل دفع أي مليم.</p>
                  <p>📦 <strong>تكلفة الشحن:</strong> مجاناً لأي طلب يتجاوز 1,000 ج.م، أو رسوم رمزية حسب المحافظة.</p>
                </div>
              )}
              {activeTab === "guide" && (
                <div className="space-y-2 text-xs leading-relaxed">
                  <p>🔄 <strong>تبديل المقاس مجاناً:</strong> إذا كان المقاس غير مناسب بعد الاستلام، يمكنك مراسلتنا خلال 14 يوماً وسيتم إرسال المندوب بالمقاس الجديد فوراً.</p>
                  <p>✨ <strong>شروط الاستبدال:</strong> الحفاظ على التيكت وحالة القطعة الأصلية دون استخدام خارجي.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 p-3 backdrop-blur-xl md:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {selectedSize ? `مقاس ${selectedSize}` : "حدد مقاسك"}
            </span>
            <span className="text-base font-black text-foreground">
              {formatPrice(p.price * qty)}
            </span>
          </div>
          <div className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isReadyToOrder}
              className={`flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold border transition-all ${
                isReadyToOrder
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/60 bg-muted text-muted-foreground opacity-60"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>السلة</span>
            </button>
            <button
              type="button"
              onClick={handleDirectWhatsAppOrder}
              disabled={!isReadyToOrder}
              className={`flex h-11 flex-2 items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
                isReadyToOrder
                  ? "bg-whatsapp text-whatsapp-foreground shadow-md shadow-whatsapp/20"
                  : "bg-muted text-muted-foreground border border-border/60 opacity-60"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>اطلب على واتساب</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.data && related.data.length > 0 && (
        <section className="mt-20 border-t border-border/60 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                منتجات قد تعجبك أيضاً
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                استكمل إطلالتك بقطع إضافية تناسب هذا الموديل
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-foreground hover:text-whatsapp flex items-center gap-1"
            >
              <span>مشاهدة الكل</span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.data.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal (Detailed Table & Guidance) */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setSizeGuideOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-border/70 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-whatsapp" />
                <h3 className="text-lg font-bold text-foreground">دليل المقاسات والأوزان الموصى بها</h3>
              </div>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl border border-border/60 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sizes & Weights Table */}
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-right text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-bold">
                  <tr>
                    <th className="px-3 py-2.5">المقاس</th>
                    <th className="px-3 py-2.5">الوزن التقريبي</th>
                    <th className="px-3 py-2.5">عرض الصدر (سم)</th>
                    <th className="px-3 py-2.5">الطول (سم)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="px-3 py-2.5 font-bold text-foreground">S</td>
                    <td className="px-3 py-2.5">50 - 62 كجم</td>
                    <td className="px-3 py-2.5">48 - 50 سم</td>
                    <td className="px-3 py-2.5">68 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-bold text-foreground">M</td>
                    <td className="px-3 py-2.5">63 - 74 كجم</td>
                    <td className="px-3 py-2.5">51 - 53 سم</td>
                    <td className="px-3 py-2.5">70 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-bold text-foreground">L</td>
                    <td className="px-3 py-2.5">75 - 85 كجم</td>
                    <td className="px-3 py-2.5">54 - 56 سم</td>
                    <td className="px-3 py-2.5">72 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-bold text-foreground">XL</td>
                    <td className="px-3 py-2.5">86 - 97 كجم</td>
                    <td className="px-3 py-2.5">57 - 59 سم</td>
                    <td className="px-3 py-2.5">74 سم</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-bold text-foreground">XXL</td>
                    <td className="px-3 py-2.5">98 - 110 كجم</td>
                    <td className="px-3 py-2.5">60 - 63 سم</td>
                    <td className="px-3 py-2.5">76 سم</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl border border-whatsapp/30 bg-whatsapp/10 p-3 text-xs leading-relaxed text-foreground">
              💡 <strong>هل ما زلت غير متأكد من مقاسك؟</strong>
              <p className="mt-1 text-muted-foreground">
                لا تقلق، يمكنك التحدث مباشرة مع مسؤول خدمة العملاء على واتساب وسيقترح لك المقاس الأنسب لك بدقة بناءً على طولك ووزنك.
              </p>
              <a
                href={generalContactLink("مرحباً، أود استشارة بخصوص اختيار المقاس المناسب")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-bold text-whatsapp underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>اسأل خبير المقاسات على واتساب</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

