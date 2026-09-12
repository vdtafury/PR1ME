import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Truck,
  PackageCheck,
  RotateCcw,
  Headset,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import type { Category, Product } from "@/lib/types";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "PR1ME — WEAR YOUR STORY | تصاميم كاجوال عصرية" },
      {
        name: "description",
        content:
          "مش مجرد ملابس دي قصتك. تصاميم يومية بخامات مريحة وجودة حقيقية مستوحاة من الشارع المصري. شحن لكافة المحافظات ومعاينة قبل الدفع.",
      },
      { property: "og:title", content: "PR1ME — WEAR YOUR STORY" },
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
        .order("sort_order")
        .limit(10);
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <div className="flex flex-col gap-12 sm:gap-16 bg-[#F7F7F5] pb-12">
      {/* 1. Hero Section - Matches Image 1 */}
      <section className="relative overflow-hidden bg-[#0D0D0D] text-white">
        <div className="relative min-h-[500px] sm:min-h-[580px] w-full flex items-center">
          {/* Background Streetwear Imagery */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroImg}
              alt="PR1ME Streetwear - Good Outfits Better Days"
              className="h-full w-full object-cover object-center brightness-75"
              fetchPriority="high"
            />
            {/* Soft gradient overlay focusing on the right text panel */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-black/80 md:to-black/90" />
          </div>

          {/* Hero Content - Aligned Right in RTL */}
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 py-16">
            <div className="flex flex-col items-start max-w-xl pr-0 md:pr-6">
              <h1 className="text-3xl font-black leading-tight sm:text-5xl lg:text-6xl text-white tracking-tight">
                مش مجرد ملابس
                <br />
                <span className="text-[#F7F7F5]">دي قصتك.</span>
              </h1>

              <p className="mt-4 text-xs sm:text-sm text-white/90 leading-relaxed max-w-md">
                تصاميم يومية بخامات مريحة وجودة حقيقية مستوحاة من الشارع المصري.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex items-center gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-[#F7F7F5] px-6 py-3 text-xs font-bold text-[#0D0D0D] transition-colors hover:bg-white active:scale-98"
                >
                  <span>تسوق الآن</span>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center border border-white/60 bg-black/30 backdrop-blur-xs px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-white/10 active:scale-98"
                >
                  <span>شاهد الكوليكشن</span>
                </Link>
              </div>

              {/* Pagination Indicator */}
              <div className="mt-12 flex items-center gap-2 text-xs font-mono text-white/70">
                <span className="font-bold text-white">01</span>
                <span className="h-px w-8 bg-white/40" />
                <span>03</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Bento Cards Banner Grid - Matches Image 1 */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card 1: Accessories */}
          <Link
            to="/products"
            search={{ category: "accessories" }}
            className="group relative aspect-[4/3] overflow-hidden bg-[#0D0D0D] text-white"
          >
            <img
              src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80"
              alt="PR1ME Accessories"
              loading="lazy"
              className="h-full w-full object-cover brightness-60 transition-transform duration-500 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-5 right-5 left-5">
              <h3 className="text-base font-bold sm:text-lg">الإكسسوارات تكمل الإطلالة</h3>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/80 group-hover:text-white">
                <span>تسوق الآن</span>
                <ArrowLeft className="h-3 w-3" />
              </p>
            </div>
          </Link>

          {/* Card 2: Summer 2026 Drops */}
          <Link
            to="/products"
            search={{ category: "t-shirts" }}
            className="group relative aspect-[4/3] overflow-hidden bg-[#0D0D0D] text-white"
          >
            <img
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"
              alt="Summer 2026 Collection"
              loading="lazy"
              className="h-full w-full object-cover brightness-60 transition-transform duration-500 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-5 right-5 left-5">
              <h3 className="text-base font-bold sm:text-lg">كوليكشن صيف 2026</h3>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/80 group-hover:text-white">
                <span>تسوق الآن</span>
                <ArrowLeft className="h-3 w-3" />
              </p>
            </div>
          </Link>

          {/* Card 3: Quality Egyptian Fabrics */}
          <Link
            to="/about"
            className="group relative aspect-[4/3] overflow-hidden bg-[#0D0D0D] text-white"
          >
            <img
              src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80"
              alt="PR1ME Fabric Quality"
              loading="lazy"
              className="h-full w-full object-cover brightness-60 transition-transform duration-500 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-5 right-5 left-5">
              <h3 className="text-base font-bold sm:text-lg">خامات مصرية بجودة حقيقية</h3>
              <p className="mt-1 text-xs font-medium text-white/80">راحة تدوم معك</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Latest Products Section - Matches Image 1 */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-bold text-[#0D0D0D] sm:text-2xl">
            أحدث المنتجات
          </h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-bold text-[#0D0D0D] hover:text-[#6B6B66] transition-colors"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {featured.isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse border border-[#E5E5E0] bg-white"
                />
              ))
            : (featured.data ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* 4. Story Banner Section - Matches Image 1 */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden bg-[#0D0D0D] text-white">
          <div className="relative min-h-[360px] sm:min-h-[420px] flex items-center">
            {/* Background Image: Model resting with street graffiti */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&auto=format&fit=crop&q=80"
                alt="PR1ME Brand Story - For A Better Version Of You"
                className="h-full w-full object-cover brightness-65 object-left"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/50 to-black/90" />
            </div>

            {/* Story Text Box (Right Side in RTL) */}
            <div className="relative z-10 mr-auto max-w-md p-6 sm:p-10 text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                مزيد من
              </span>
              <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                قصة PR1ME
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-white/90 leading-relaxed">
                براند مصري مستقل. نؤمن إن الإطلالة مش مجرد ملابس لكن انعكاس لشخصيتك. نصمم لك طقم يومك وترافقك في رحلتك.
              </p>
              <div className="mt-6">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-[#F7F7F5] px-5 py-2.5 text-xs font-bold text-[#0D0D0D] transition-colors hover:bg-white"
                >
                  <span>تعرف أكثر</span>
                  <ArrowLeft className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 4 Trust / Service Features Strip - Matches Image 1 */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 border border-[#E5E5E0] bg-white p-5 sm:grid-cols-4 sm:p-6 text-center">
          {/* 1. Fast Shipping */}
          <div className="flex flex-col items-center">
            <Truck className="h-6 w-6 text-[#0D0D0D]" />
            <h4 className="mt-2 text-xs font-bold text-[#0D0D0D]">شحن لجميع المحافظات</h4>
            <p className="mt-0.5 text-[11px] text-[#6B6B66]">من 2 – 5 أيام</p>
          </div>

          {/* 2. Inspection Before Payment */}
          <div className="flex flex-col items-center">
            <PackageCheck className="h-6 w-6 text-[#0D0D0D]" />
            <h4 className="mt-2 text-xs font-bold text-[#0D0D0D]">معاينة قبل الدفع</h4>
            <p className="mt-0.5 text-[11px] text-[#6B6B66]">اطلب وجرب براحتك</p>
          </div>

          {/* 3. Easy Exchange */}
          <div className="flex flex-col items-center">
            <RotateCcw className="h-6 w-6 text-[#0D0D0D]" />
            <h4 className="mt-2 text-xs font-bold text-[#0D0D0D]">استبدال بسهولة</h4>
            <p className="mt-0.5 text-[11px] text-[#6B6B66]">خلال 14 يوم</p>
          </div>

          {/* 4. WhatsApp Fast Support */}
          <div className="flex flex-col items-center">
            <Headset className="h-6 w-6 text-[#0D0D0D]" />
            <h4 className="mt-2 text-xs font-bold text-[#0D0D0D]">دعم سريع عبر واتساب</h4>
            <p className="mt-0.5 text-[11px] text-[#6B6B66]">من 10 ص – 10 م</p>
          </div>
        </div>
      </section>
    </div>
  );
}
