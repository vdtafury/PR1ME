import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generalContactLink } from "@/lib/whatsapp";
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="border-b border-border pb-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          PROMOTIONS & BUNDLES
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          العروض والتخفيضات الخاصة
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          باقات توفير وخصومات على تشكيلات مختارة. اضغط على أي عرض لطلبه مباشرة عبر واتساب.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {q.data?.map((o) => (
          <a
            key={o.id}
            href={
              o.link_url ||
              generalContactLink(`مرحباً PR1ME، أود الاستفادة من العرض: ${o.title}`)
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
                <span className="mb-2 w-fit rounded-xs bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
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
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>اطلب هذا العرض عبر واتساب ←</span>
                </span>
              </div>
            </div>
          </a>
        ))}

        {q.data?.length === 0 && (
          <div className="col-span-2 border border-dashed border-border p-12 text-center text-muted-foreground">
            <Tag className="mx-auto h-8 w-8 opacity-30 mb-2" />
            <p className="text-sm font-bold text-foreground">لا توجد عروض نشطة حالياً</p>
            <p className="text-xs text-muted-foreground mt-1">
              تابعنا باستمرار للاستفادة من تخفيضات الموسم القادمة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
