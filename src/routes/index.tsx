import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MessageCircle,
  Truck,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, generalContactLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/ProductCard";
import type { Category, Product, Offer } from "@/lib/types";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "PR1ME — أزياء كاجوال عصرية فاخرة | اطلب عبر واتساب" },
      {
        name: "description",
        content:
          "تسوق أرقى الملابس الكاجوال العصرية في مصر. خامات عالية الجودة، شحن سريع لكافة المحافظات، ومعاينة قبل الدفع كاش عند الاستلام.",
      },
      { property: "og:title", content: "PR1ME — أزياء كاجوال عصرية فاخرة" },
      {
        property: "og:description",
        content: "تسوق أرقى الملابس الكاجوال مع سرعة الطلب المباشر على واتساب.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function HomePage() {
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const featured = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .eq("is_featured", true)
        .order("sort_order")
        .limit(8);
      if (error) throw error;
      return data as Product[];
    },
  });

  const offers = useQuery({
    queryKey: ["offers-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .limit(2);
      if (error) throw error;
      return data as Offer[];
    },
  });

  return (
    <div className="flex flex-col gap-16 sm:gap-24 overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-card/30 via-background to-background py-12 sm:py-20 lg:py-24">
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-whatsapp/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-0 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12">
          {/* Hero Copy */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-whatsapp pulse-dot" />
              <span className="text-foreground">الموسم الجديد • New Drops 2026</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-gold font-black">خصومات حتى 40%</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-4xl font-black leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              أناقة كاجوال استثنائية.
              <br />
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-whatsapp bg-clip-text text-transparent">
                بأسهل تجربة طلب في مصر.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              اختر قطعك المفضلة من تشكيلة <strong className="text-foreground">PR1ME</strong> الحصرية بخامات قطنية راقية وقَصّات مريحة. اطلب مباشرة عبر واتساب مع ميزة <strong>المعاينة وقياس المنتج قبل الاستلام والدفع كاش!</strong>
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
              <Link
                to="/products"
                className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-foreground px-7 py-3.5 text-sm font-bold text-background shadow-lg shadow-black/20 transition-all hover:bg-foreground/90 hover:scale-102 active:scale-98"
              >
                <span>تصفح الكتالوج بالكامل</span>
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <a
                href={generalContactLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-3.5 text-sm font-bold text-whatsapp-foreground shadow-lg shadow-whatsapp/20 transition-all hover:bg-whatsapp-hover hover:scale-102 active:scale-98"
              >
                <MessageCircle className="h-4 w-4" />
                <span>اطلب عبر واتساب</span>
              </a>
            </div>

            {/* Trust Micro Strip */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/50 pt-6 text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <Truck className="h-4 w-4 text-whatsapp" />
                شحن سريع لجميع المحافظات
              </span>
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <ShieldCheck className="h-4 w-4 text-whatsapp" />
                معاينة المنتج قبل الدفع
              </span>
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <Zap className="h-4 w-4 text-whatsapp" />
                تأكيد فوري خلال دقائق
              </span>
            </div>
          </div>

          {/* Hero Visual Area */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-3xl border border-border/70 bg-card p-2 shadow-2xl shadow-black/40">
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-muted">
                <img
                  src={heroImg}
                  alt="PR1ME Luxury Casual Fashion"
                  width={1600}
                  height={1100}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Review Badge */}
                <div className="absolute bottom-4 right-4 left-4 rounded-2xl border border-white/15 bg-black/60 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        خامات قطنية 100% معالجة
                      </p>
                      <p className="mt-0.5 text-xs text-white/80">ثبات في الألوان ومقاومة للانكماش</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-whatsapp/20 px-2 py-1 text-xs font-black text-whatsapp">
                      <Star className="h-3.5 w-3.5 fill-current text-yellow-400" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeader
          title="تسوق حسب القسم"
          subtitle="اختر التصنيف المفضل لتصفح أحدث الموديلات والمقاسات"
          cta={{ label: "عرض كل المنتجات", to: "/products" }}
        />
        <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(categories.data ?? []).map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:border-foreground hover:shadow-xl hover:-translate-y-1"
            >
              {c.image_url ? (
                <img
                  src={c.image_url}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="h-full w-full bg-muted/40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity group-hover:opacity-90" />
              <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between">
                <div>
                  <span className="text-base font-extrabold text-white">{c.name}</span>
                  <p className="text-[10px] text-white/70 font-semibold">تصفح الكولكشن</p>
                </div>
                <div className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-transform group-hover:-translate-x-1">
                  <ChevronLeft className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeader
          title="القطع الأكثر طلباً ومبيعاً"
          subtitle="مختارة بعناية لأناقتك اليومية بأسعار لا تقبل المنافسة"
          cta={{ label: "مشاهدة المزيد", to: "/products" }}
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl border border-border/50 bg-muted/40"
                />
              ))
            : (featured.data ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Special Offers Spotlight */}
      {(offers.data?.length ?? 0) > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <SectionHeader
            title="عروض حصرية وخصومات خاصة"
            subtitle="فرصتك لاقتناء أفضل القطع بخصومات استثنائية لفترة محدودة"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {offers.data!.map((o) => (
              <a
                key={o.id}
                href={
                  o.link_url ||
                  generalContactLink(`مرحباً PR1ME، أود الاستفسار عن العرض: ${o.title}`)
                }
                target={o.link_url ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className="group relative block aspect-[16/9] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg transition-all duration-300 hover:border-whatsapp hover:shadow-2xl hover:-translate-y-1"
              >
                {o.image_url && (
                  <img
                    src={o.image_url}
                    alt={o.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-8">
                  {o.badge_text && (
                    <span className="mb-2 w-fit rounded-full bg-whatsapp px-3 py-1 text-xs font-extrabold uppercase shadow-sm">
                      {o.badge_text}
                    </span>
                  )}
                  <h3 className="text-2xl font-black text-white sm:text-3xl">{o.title}</h3>
                  {o.description && (
                    <p className="mt-2 max-w-md text-sm text-white/90 leading-relaxed">
                      {o.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-whatsapp">
                    <span className="rounded-xl bg-white px-4 py-2 text-black shadow-md transition-transform group-hover:scale-105">
                      احصل على العرض عبر واتساب ←
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* How to Order in 3 Simple Steps */}
      <section className="border-y border-border/50 bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-foreground/10 px-3.5 py-1 text-xs font-bold text-foreground">
              سهولة وتأكيد فوري
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              كيف تطلب من PR1ME في 3 خطوات بسيطة؟
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              لا حاجة لبطاقات ائتمانية أو تسجيل دخول معقد — اطلب كأنك تتحدث مع صديقك!
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="relative flex flex-col items-center rounded-2xl border border-border/60 bg-card p-6 text-center shadow-xs transition-transform hover:-translate-y-1">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-xl font-black text-background shadow-md">
                1
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">اختر قطعتك ومقاسك</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                تصفح الكتالوج، اختر اللون والمقاس المناسب، واستعن بجدول المقاسات لتحديد الأنسب لك بدقة.
              </p>
            </div>

            <div className="relative flex flex-col items-center rounded-2xl border border-border/60 bg-card p-6 text-center shadow-xs transition-transform hover:-translate-y-1">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-whatsapp text-xl font-black text-whatsapp-foreground shadow-md">
                2
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">اضغط "اطلب على واتساب"</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                سيتم تحويلك فوراً لمحادثة واتساب مجهزة بكافة تفاصيل طلبك لتأكيد العنوان ورقم الهاتف.
              </p>
            </div>

            <div className="relative flex flex-col items-center rounded-2xl border border-border/60 bg-card p-6 text-center shadow-xs transition-transform hover:-translate-y-1">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-xl font-black text-background shadow-md">
                3
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">عاين المنتج وادفع كاش</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                يصلك مندوبنا خلال 2 إلى 4 أيام. عاين القطعة وقسها أولاً للتأكد من رضاك التام ثم ادفع.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Trust Proof */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeader
          title="آراء عملائنا وتجاربهم"
          subtitle="أكثر من 5,000 عميل يثقون في خامات وتصاميم PR1ME"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              name: "أحمد منصور (القاهرة)",
              text: "الخامة ممتازة جداً فوق ما كنت متوقع وسعرها رخيص مقارنة بالبراندات التانية. والأجمل إن المندوب استناني أقيس التيشيرت قبل ما أدفع!",
              rating: 5,
            },
            {
              name: "سارة حسن (الإسكندرية)",
              text: "خدمة العملاء على الواتساب سريعة جداً وساعدوني أختار المقاس المضبوط بالمللي. التوصيل وصل في يومين بس والتغليف شيك جداً.",
              rating: 5,
            },
            {
              name: "كريم عبد الله (الجيزة)",
              text: "الهودي خامته تقيلة ونعومة القطن ممتازة، اتغسل مرتين ولسه زي الجديد بدون أي انكماش أو تغير في اللون. شكرًا PR1ME.",
              rating: 5,
            },
          ].map((review, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-xs"
            >
              <div>
                <div className="flex gap-1 text-yellow-400 mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">"{review.text}"</p>
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-border/40 pt-4">
                <CheckCircle2 className="h-4 w-4 text-whatsapp" />
                <span className="text-xs font-bold text-foreground">{review.name}</span>
                <span className="text-[10px] text-muted-foreground">• مشترٍ مؤكد</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Concierge CTA Strip */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-border/70 bg-gradient-to-r from-card via-muted/30 to-card p-8 sm:p-12 md:flex-row shadow-xl">
          <div>
            <span className="text-xs font-bold text-whatsapp">خدمة عملاء على مدار الساعة</span>
            <h3 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
              محتار في اختيار المقاس أو الموديل المناسب؟
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              فريقنا جاهز على واتساب لمساعدتك في اختيار المقاس المناسب لوزنك وطولك فوراً.
            </p>
          </div>
          <a
            href={generalContactLink("مرحباً PR1ME، أحتاج مساعدة في اختيار المقاس المناسب لي")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-whatsapp px-8 py-4 text-sm font-bold text-whatsapp-foreground shadow-lg shadow-whatsapp/25 transition-all hover:bg-whatsapp-hover hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <MessageCircle className="h-5 w-5" />
            <span>تحدث مع خبير المقاسات على واتساب</span>
          </a>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle?: string;
  cta?: { label: string; to: string };
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {cta && (
        <Link
          to={cta.to}
          className="inline-flex items-center gap-1 text-sm font-bold text-foreground transition-colors hover:text-whatsapp"
        >
          <span>{cta.label}</span>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

