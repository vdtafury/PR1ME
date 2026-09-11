import { Instagram, Facebook, MessageCircle, MapPin, Clock } from "lucide-react";
import { BRAND, generalContactLink } from "@/lib/whatsapp";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-foreground text-background font-extrabold">P</div>
            <span className="text-lg font-extrabold">{BRAND.name}</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{BRAND.tagline}</p>
          <a
            href={generalContactLink()}
            target="_blank" rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-whatsapp px-5 py-2.5 text-sm font-semibold text-whatsapp-foreground hover:bg-whatsapp-hover"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/offers" className="hover:text-foreground">Offers</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /> {BRAND.location}</li>
            <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4" /> {BRAND.hours}</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a href={generalContactLink()} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-background"><MessageCircle className="h-4 w-4" /></a>
            <a href={BRAND.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-background"><Instagram className="h-4 w-4" /></a>
            <a href={BRAND.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-background"><Facebook className="h-4 w-4" /></a>
            <a href={BRAND.tiktok} aria-label="TikTok" target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-background text-xs font-bold">TT</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
