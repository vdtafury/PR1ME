import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Truck, Clock, MapPin, ShoppingBag } from "lucide-react";
import { BRAND, generalContactLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About NOVA — Affordable Fashion, Fast Delivery" },
      { name: "description", content: "Learn about NOVA: who we are, how we ship, and how to order via WhatsApp." },
      { property: "og:title", content: "About NOVA" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">About {BRAND.name}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        {BRAND.name} is a casual fashion catalog focused on bringing you affordable, trendy everyday clothing.
        We curate quality basics and seasonal pieces, then make ordering as simple as a WhatsApp message.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Info icon={<ShoppingBag className="h-5 w-5" />} title="How to order">
          Browse the catalog, tap “Order on WhatsApp” on any product, and confirm your size & address with us.
        </Info>
        <Info icon={<Truck className="h-5 w-5" />} title="Shipping">
          Nationwide delivery. Free shipping on orders over EGP 1000. Delivery in 2–4 business days.
        </Info>
        <Info icon={<MapPin className="h-5 w-5" />} title="Service area">
          {BRAND.location}
        </Info>
        <Info icon={<Clock className="h-5 w-5" />} title="Working hours">
          {BRAND.hours}
        </Info>
      </div>

      <a href={generalContactLink()} target="_blank" rel="noopener noreferrer"
        className="mt-10 inline-flex items-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-sm font-bold text-whatsapp-foreground hover:bg-whatsapp-hover">
        <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
      </a>
    </div>
  );
}

function Info({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-foreground">{icon}<h3 className="font-bold">{title}</h3></div>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
