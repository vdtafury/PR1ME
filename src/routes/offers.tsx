import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generalContactLink } from "@/lib/whatsapp";
import type { Offer } from "@/lib/types";

export const Route = createFileRoute("/offers")({
  component: OffersPage,
  head: () => ({
    meta: [
      { title: "Offers & Deals — NOVA" },
      { name: "description", content: "Current promotions, discounts and bundle deals from NOVA." },
      { property: "og:title", content: "Offers & Deals — NOVA" },
      { property: "og:url", content: "/offers" },
    ],
    links: [{ rel: "canonical", href: "/offers" }],
  }),
});

function OffersPage() {
  const q = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data as Offer[];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Current offers</h1>
      <p className="mt-1 text-sm text-muted-foreground">Don't miss out — message us to claim.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {q.data?.map((o) => (
          <a key={o.id} href={o.link_url || generalContactLink(`Hi! I'd like to know more about: ${o.title}`)} target={o.link_url ? "_self" : "_blank"} rel="noopener noreferrer"
            className="group relative block aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted">
            {o.image_url && <img src={o.image_url} alt={o.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
              {o.badge_text && <span className="mb-2 w-fit rounded bg-whatsapp px-2 py-0.5 text-[11px] font-bold uppercase">{o.badge_text}</span>}
              <h3 className="text-2xl font-extrabold">{o.title}</h3>
              {o.description && <p className="mt-1 max-w-md text-sm opacity-90">{o.description}</p>}
              <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-md bg-whatsapp px-3 py-1.5 text-xs font-bold text-whatsapp-foreground">
                <MessageCircle className="h-3.5 w-3.5" /> Claim on WhatsApp
              </span>
            </div>
          </a>
        ))}
        {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No active offers right now. Check back soon!</p>}
      </div>
    </div>
  );
}
