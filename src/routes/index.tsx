import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Truck, ShieldCheck, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, generalContactLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/ProductCard";
import type { Category, Product, Offer } from "@/lib/types";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "NOVA — Affordable Casual Fashion, Order on WhatsApp" },
      { name: "description", content: "Shop modern casual clothing for men, women & kids. Fast WhatsApp ordering, nationwide shipping." },
      { property: "og:title", content: "NOVA — Affordable Casual Fashion" },
      { property: "og:description", content: "Shop modern casual clothing. Order instantly on WhatsApp." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function HomePage() {
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const featured = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products").select("*")
        .eq("is_available", true).eq("is_featured", true)
        .order("sort_order").limit(8);
      if (error) throw error;
      return data as Product[];
    },
  });

  const offers = useQuery({
    queryKey: ["offers-home"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*").eq("is_active", true).order("sort_order").limit(2);
      if (error) throw error;
      return data as Offer[];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-muted/60 to-background">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-block rounded-full bg-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/70">New Season • Mega Sale</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Nova — Affordable casual fashion.<br />
              <span className="text-whatsapp">Order in seconds.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
              {BRAND.tagline} Browse the catalog and tap “Order on WhatsApp” — we'll handle the rest.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={generalContactLink()} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-sm font-bold text-whatsapp-foreground shadow-sm hover:bg-whatsapp-hover">
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
              <Link to="/products" className="inline-flex items-center rounded-md border border-border bg-background px-6 py-3 text-sm font-bold hover:bg-muted">
                Browse catalog
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Nationwide shipping</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Fast WhatsApp orders</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Cash on delivery</span>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
            <img src={heroImg} alt="NOVA casual fashion" width={1600} height={1100} className="h-full w-full object-cover" fetchPriority="high" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeader title="Shop by category" subtitle="Find your style fast" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {(categories.data ?? []).map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              {c.image_url && (
                <img src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 text-sm font-bold text-white">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Offers */}
      {(offers.data?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {offers.data!.map((o) => (
              <a key={o.id} href={o.link_url || generalContactLink(`Hi! I'd like to know more about: ${o.title}`)} target={o.link_url ? "_self" : "_blank"} rel="noopener noreferrer"
                className="group relative block aspect-[16/8] overflow-hidden rounded-xl border border-border bg-muted">
                {o.image_url && <img src={o.image_url} alt={o.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                  {o.badge_text && <span className="mb-2 w-fit rounded bg-whatsapp px-2 py-0.5 text-[11px] font-bold uppercase">{o.badge_text}</span>}
                  <h3 className="text-xl font-extrabold sm:text-2xl">{o.title}</h3>
                  {o.description && <p className="mt-1 text-sm opacity-90">{o.description}</p>}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeader title="Featured products" subtitle="Hand-picked best-sellers" cta={{ label: "View all", to: "/products" }} />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.isLoading
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />)
            : (featured.data ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Order Steps */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeader title="How it works" subtitle="3 simple steps to get your order" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center text-center rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary mb-4">1</div>
            <h3 className="text-lg font-bold">Choose your items</h3>
            <p className="mt-2 text-sm text-muted-foreground">Browse our catalog, select your preferred sizes and colors, and add them to your cart.</p>
          </div>
          <div className="flex flex-col items-center text-center rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary mb-4">2</div>
            <h3 className="text-lg font-bold">Order on WhatsApp</h3>
            <p className="mt-2 text-sm text-muted-foreground">Open your cart and click 'Order on WhatsApp'. Send the pre-filled message to our team.</p>
          </div>
          <div className="flex flex-col items-center text-center rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary mb-4">3</div>
            <h3 className="text-lg font-bold">Receive at your door</h3>
            <p className="mt-2 text-sm text-muted-foreground">We deliver nationwide in Egypt within 2-5 days. Pay cash on delivery (COD) after checking your items.</p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeader title="What our customers say" subtitle="Join thousands of happy customers" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { name: "Ahmed M.", text: "The quality is amazing for the price. Fits perfectly and arrived in just 2 days! Definitely buying again.", rating: 5 },
            { name: "Sara H.", text: "I love the dark aesthetic of NOVA. The customer service on WhatsApp was very helpful with sizing.", rating: 5 },
            { name: "Omar K.", text: "Great material and the delivery guy let me check everything before paying. Highly recommended.", rating: 5 },
          ].map((review, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-yellow-500 mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <svg key={j} className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-sm italic text-muted-foreground">"{review.text}"</p>
              </div>
              <p className="mt-4 text-sm font-bold text-foreground/90">— {review.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-y border-border bg-foreground py-10 text-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="text-xl font-extrabold sm:text-2xl">Need help choosing? Chat with us.</h3>
            <p className="text-sm opacity-80">We reply in minutes during working hours.</p>
          </div>
          <a href={generalContactLink()} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-sm font-bold text-whatsapp-foreground hover:bg-whatsapp-hover">
            <MessageCircle className="h-4 w-4" /> Message on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle, cta }: { title: string; subtitle?: string; cta?: { label: string; to: string } }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {cta && (
        <Link to={cta.to} className="text-sm font-semibold text-foreground/70 hover:text-foreground">{cta.label} →</Link>
      )}
    </div>
  );
}
