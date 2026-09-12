import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generalContactLink } from "@/lib/whatsapp";
import { resolveImageUrl } from "@/lib/images";
import type { Offer } from "@/lib/types";

export const Route = createFileRoute("/offers")({
  component: OffersPage,
  head: () => ({
    meta: [
      { title: "العروض والخصومات الخاصة — PR1ME" },
      {
        name: "description",
        content: "اكتشف أحدث العروض والخصومات الترويجية على الملابس الكاجوال من PR1ME.",
      },
      { property: "og:title", content: "العروض والخصومات — PR1ME" },
      { property: "og:url", content: "/offers" },
    ],
    links: [{ rel: "canonical", href: "/offers" }],
  }),
});

function OffersPage() {
  const q = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Offer[];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-10 overflow-x-hidden">
      <div className="border-b border-[#E5E5E0] pb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9B89A]">
          PROMOTIONS & BUNDLES
        </span>
        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#0D0D0D]">
          العروض والتخفيضات الخاصة
        </h1>
        <p className="mt-0.5 text-xs text-[#6B6B66]">
          باقات توفير وخصومات حصرية على تشكيلات مختارة
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {q.data?.map((o) => (
          <a
            key={o.id}
            href={
              o.link_url ||
              generalContactLink(`مرحباً PR1ME، أود الاستفادة من العرض: ${o.title}`)
            }
            target={o.link_url ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className="group relative block aspect-[16/10] sm:aspect-[16/9] overflow-hidden border border-[#E5E5E0] bg-[#0D0D0D] text-white transition-colors"
          >
            {o.image_url && (
              <img
                src={resolveImageUrl(o.image_url)}
                alt={o.title}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = "/brand/story-banner.jpg";
                }}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
              {o.badge_text && (
                <span className="mb-2 w-fit rounded-xs bg-[#8B2E2E] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  {o.badge_text}
                </span>
              )}
              <h3 className="text-lg sm:text-2xl font-black text-white">{o.title}</h3>
              {o.description && (
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed max-w-md line-clamp-2">
                  {o.description}
                </p>
              )}
              <div className="mt-3">
                <span className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-bold text-white underline underline-offset-4">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>اطلب العرض عبر واتساب ←</span>
                </span>
              </div>
            </div>
          </a>
        ))}

        {q.data?.length === 0 && (
          <div className="col-span-2 border border-dashed border-[#E5E5E0] bg-white p-8 text-center text-[#6B6B66]">
            <Tag className="mx-auto h-8 w-8 opacity-30 mb-2" />
            <p className="text-sm font-bold text-[#0D0D0D]">لا توجد عروض نشطة حالياً</p>
            <p className="text-xs text-[#6B6B66] mt-1">
              تابعنا باستمرار للاستفادة من تخفيضات الموسم القادمة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
