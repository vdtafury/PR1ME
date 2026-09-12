import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
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
      { title: "PR1ME — أزياء كاجوال عصرية في مصر | اطلب عبر واتساب" },
      {
        name: "description",
        content:
          "تسوق أرقى الملابس الكاجوال اليومية من PR1ME. خامات قطنية متينة، شحن سريع لكافة المحافظات، ومعاينة وقياس قبل الدفع كاش عند الاستلام.",
      },
      { property: "og:title", content: "PR1ME — أزياء كاجوال عصرية في مصر" },
      {
        property: "og:description",
        content: "ملابس كاجوال بخامات ممتازة مع سهولة الطلب المباشر عبر واتساب والمعاينة قبل الدفع.",
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
    <div className="flex flex-col gap-16 sm:gap-20">
      {/* Editorial Product-Dominant Hero */}
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-10 py-10 md:grid-cols-12 md:py-16">
            {/* Hero Copy */}
            <div className="flex flex-col items-start md:col-span-7">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                New Season • Drop 2026
              </span>

              <h1 className="mt-3 text-3xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl tracking-tight">
                أزياء كاجوال يومية.
                <br />
                <span className="text-muted-foreground font-normal">
                  مصممة لتدوم وتناسب يومك.
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                ملابس كاجوال مصنوعة من خامات قطنية معالجة ضد الانكماش وبهتان الألوان.
                اطلب قطعتك بسهولة في محادثة مباشرة عبر واتساب مع ميزة <strong>المعاينة والقياس بحضور المندوب قبل دفع أي مبلغ كاش</strong>.
              </p>

              {/* Practical CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/products"
                  className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xs bg-foreground px-6 py-3.5 text-xs font-bold text-background transition-colors hover:bg-zinc-200"
                >
                  <span>تصفح الكتالوج بالكامل</span>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                <a
                  href={generalContactLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xs border border-emerald-600/50 bg-emerald-950/20 px-5 py-3.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-900/30"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>اطلب عبر واتساب</span>
                </a>
              </div>

              {/* Guarantees Micro-Strip */}
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-border pt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>معاينة وقياس قبل الدفع</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-500" />
                  <span>توصيل 2-4 أيام لكافة المحافظات</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-emerald-500" />
                  <span>استبدال مقاس خلال 14 يوم</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Area */}
            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-muted">
                <img
                  src={heroImg}
                  alt="PR1ME Casual Apparel"
                  width={1600}
                  height={1100}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                    PR1ME CORE COLLECTION
                  </span>
                  <p className="mt-1 text-xs font-semibold text-white/90">
                    قطن مصري 100% معالج • قَصّات مريحة وتفاصيل متينة
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              تصفح حسب القسم
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              اختر الفئة للاطلاع على الموديلات والمقاسات المتوفرة
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(categories.data ?? []).map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="group relative block aspect-[3/4] overflow-hidden border border-border bg-card transition-colors hover:border-zinc-600"
            >
              {c.image_url ? (
                <img
                  src={c.image_url}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 right-3 left-3">
                <span className="block text-sm font-bold text-white">{c.name}</span>
                <span className="text-[10px] font-medium text-white/70">تصفح القطع ←</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              القطع الأكثر طلباً
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              أحدث الإصدارات والموديلات الجاهزة للشحن الفوري
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <span>جميع المنتجات ({featured.data?.length ?? 0})</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {featured.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse border border-border bg-muted/40"
                />
              ))
            : (featured.data ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Promotional Spotlight (If Offers Exist) */}
      {(offers.data?.length ?? 0) > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              عروض وتخفيضات خاصة
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              باقات حصرية وخصومات لفترة محدودة على تشكيلات مختارة
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {offers.data!.map((o) => (
              <a
                key={o.id}
                href={
                  o.link_url ||
                  generalContactLink(`مرحباً PR1ME، أود الاستفسار عن العرض: ${o.title}`)
                }
                target={o.link_url ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className="group relative block aspect-[16/9] overflow-hidden border border-border bg-card transition-colors hover:border-zinc-500"
              >
                {o.image_url && (
                  <img
                    src={o.image_url}
                    alt={o.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white sm:p-7">
                  {o.badge_text && (
                    <span className="mb-2 w-fit rounded-xs bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {o.badge_text}
                    </span>
                  )}
                  <h3 className="text-xl font-black text-white sm:text-2xl">{o.title}</h3>
                  {o.description && (
                    <p className="mt-1.5 max-w-md text-xs text-zinc-300 leading-relaxed">
                      {o.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white underline underline-offset-4">
                      طلب العرض عبر واتساب ←
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* How Ordering Works (Commercial Clarity) */}
      <section className="border-y border-border bg-card/20 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              تجربة تسوق سهلة ومريحة
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              كيف تطلب من PR1ME في 3 خطوات؟
            </h2>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              لا داعي لإدخال بطاقات بنكية أو إنشاء حسابات معقدة.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="border border-border bg-card p-5">
              <span className="font-mono text-xs font-black text-muted-foreground">01</span>
              <h3 className="mt-3 text-base font-bold text-foreground">اختر قطعتك ومقاسك</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                تصفح الكتالوج، حدد لونك ومقاسك المفضل، واستعن بجدول المقاسات الدقيق لمعرفة الأنسب لوزنك وطولك.
              </p>
            </div>

            <div className="border border-border bg-card p-5">
              <span className="font-mono text-xs font-black text-emerald-400">02</span>
              <h3 className="mt-3 text-base font-bold text-foreground">تأكيد الطلب على واتساب</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                بضغطة واحدة، تفتح محادثة واتساب مجهزة بكامل بيانات طلبك مع ممثل خدمة العملاء لتأكيد العنوان وموعد الشحن.
              </p>
            </div>

            <div className="border border-border bg-card p-5">
              <span className="font-mono text-xs font-black text-muted-foreground">03</span>
              <h3 className="mt-3 text-base font-bold text-foreground">المعاينة ثم الدفع كاش</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                يصلك المندوب خلال 2 إلى 4 أيام. افتح الشحنة وقس القطعة وتأكد من الخامة أولاً قبل دفع أي مليم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Standards & Direct Sizing Help (Replaces Fake Reviews) */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              معايير PR1ME
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              الجودة والراحة في كل تفصيلة
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              في PR1ME، نركز على أساسيات الملابس اليومية: خامات قطنية مصرية فاخرة تعيش طويلاً، قَصّات مريحة لا تعيق حركتك، ومعالجة خاصة ضد الانكماش والبهتان بعد الغسيل المتكرر.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="border border-border p-4 bg-card/40">
                <h4 className="font-bold text-foreground">خامات قطن ممشط 100%</h4>
                <p className="mt-1 text-muted-foreground">نعومة فائقة على البشرة مع متانة تتحمل الاستخدام اليومي.</p>
              </div>
              <div className="border border-border p-4 bg-card/40">
                <h4 className="font-bold text-foreground">حق المعاينة قبل الاستلام</h4>
                <p className="mt-1 text-muted-foreground">لك كامل الحق في قياس القطعة وفحص الخياطة قبل الدفع للمندوب.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 border border-border bg-card p-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              مساعدة فورية في المقاس
            </span>
            <h3 className="mt-2 text-lg font-bold text-foreground">
              محتار بين مقاسين؟
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              أرسل وزنك وطولك لممثل خدمة العملاء وسيقترح لك المقاس المضبوط تماماً بناءً على قَصّة الموديل.
            </p>
            <a
              href={generalContactLink("مرحباً PR1ME، أحتاج مساعدة في اختيار المقاس المناسب لوزني وطولي")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 rounded-xs bg-emerald-600 px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-emerald-500 w-full"
            >
              <MessageCircle className="h-4 w-4" />
              <span>استشر خبير المقاسات على واتساب</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
