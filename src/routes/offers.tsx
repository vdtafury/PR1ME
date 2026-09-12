import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Sparkles, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generalContactLink } from "@/lib/whatsapp";
import type { Offer } from "@/lib/types";

export const Route = createFileRoute("/offers")({
  component: OffersPage,
  head: () => ({
    meta: [
      { title: "العروض والخصومات الحصرية — PR1ME" },
      {
        name: "description",
        content: "اكتشف أحدث العروض والخصومات الترويجية الحصرية على الملابس الكاجوال من PR1ME.",
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="border-b border-border/60 pb-6">
        <div className="flex items-center gap-2 text-whatsapp font-bold text-xs uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>فرص محدودة لفترة وجيزة</span>
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          العروض والخصومات الحصرية
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          استفد من باقات التوفير وأقوى الخصومات. اضغط على أي عرض لطلبه مباشرة عبر واتساب.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {q.data?.map((o) => (
          <a
            key={o.id}
            href={
              o.link_url ||
              generalContactLink(`مرحباً PR1ME، أود الاستفادة من العرض الحصري: ${o.title}`)
            }
            target={o.link_url ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className="group relative block aspect-[16/9] overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xl transition-all duration-300 hover:border-whatsapp hover:shadow-2xl hover:-translate-y-1"
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
                <span className="mb-2.5 w-fit rounded-full bg-whatsapp px-3 py-1 text-xs font-black uppercase shadow-md">
                  {o.badge_text}
                </span>
              )}
              <h3 className="text-2xl font-black sm:text-3xl">{o.title}</h3>
              {o.description && (
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90">{o.description}</p>
              )}
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black shadow-lg transition-transform group-hover:scale-105">
                  <MessageCircle className="h-4 w-4 text-whatsapp" />
                  <span>اطلب العرض الآن عبر واتساب</span>
                </span>
              </div>
            </div>
          </a>
        ))}

        {q.data?.length === 0 && (
          <div className="col-span-2 rounded-3xl border border-dashed border-border/80 p-12 text-center text-muted-foreground">
            <Tag className="mx-auto h-12 w-12 opacity-30 mb-3" />
            <p className="text-base font-bold text-foreground">لا توجد عروض نشطة حالياً</p>
            <p className="text-xs text-muted-foreground mt-1">تابعنا باستمرار للاستفادة من تخفيضات الموسم القادمة.</p>
          </div>
        )}
      </div>
    </div>
  );
}

