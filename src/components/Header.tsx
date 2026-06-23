import { Link } from "@tanstack/react-router";
import { MessageCircle, Menu, X, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { BRAND, generalContactLink } from "@/lib/whatsapp";
import { AnnouncementBar } from "./AnnouncementBar";
import { useCartStore } from "@/lib/store";

export function Header() {
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="sticky top-0 z-40 flex flex-col">
      <AnnouncementBar />
      <header className="border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-foreground text-background font-extrabold">N</div>
            <span className="text-lg font-extrabold tracking-tight">{BRAND.name}</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground">Home</Link>
            <Link to="/products" className="text-sm font-medium text-foreground/80 hover:text-foreground">Shop</Link>
            <Link to="/offers" className="text-sm font-medium text-foreground/80 hover:text-foreground">Offers</Link>
            <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground">About</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative grid h-10 w-10 place-items-center rounded-md hover:bg-muted"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </button>
            <a
              href={generalContactLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-md bg-whatsapp px-4 py-2 text-sm font-semibold text-whatsapp-foreground transition-colors hover:bg-whatsapp-hover sm:inline-flex"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <button
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-md border border-border md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-border bg-background md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
              {[
                ["Home", "/"],
                ["Shop", "/products"],
                ["Offers", "/offers"],
                ["About", "/about"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-base font-medium hover:bg-muted"
                >
                  {label}
                </Link>
              ))}
              <a
                href={generalContactLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-whatsapp px-4 py-3 text-sm font-semibold text-whatsapp-foreground"
              >
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
