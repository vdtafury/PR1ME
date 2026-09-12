import { Link } from "@tanstack/react-router";
import { MessageCircle, Menu, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { BRAND, generalContactLink } from "@/lib/whatsapp";
import { AnnouncementBar } from "./AnnouncementBar";
import { useCartStore } from "@/lib/store";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "المتجر والمنتجات", href: "/products" },
    { label: "العروض الحصرية", href: "/offers", badge: "خصومات" },
    { label: "عن البراند", href: "/about" },
  ];

  return (
    <div className="sticky top-0 z-40 flex flex-col">
      <AnnouncementBar />
      <header
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "glass-nav py-3 shadow-lg shadow-black/20"
            : "border-b border-border/50 bg-background/90 backdrop-blur-md py-4"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 text-background font-black shadow-md transition-transform duration-300 group-hover:scale-105">
              <span className="text-xl tracking-tighter">P</span>
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-whatsapp pulse-dot" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-foreground transition-colors group-hover:text-foreground/90">
                {BRAND.name}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Casual Fashion
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative rounded-lg px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground active:scale-95"
              >
                {link.label}
                {link.badge && (
                  <span className="mr-1.5 inline-block rounded-full bg-sale/20 px-2 py-0.2 text-[10px] font-bold text-sale">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3.5 text-sm font-semibold transition-all duration-200 hover:border-border hover:bg-muted active:scale-95"
              aria-label="سلة المشتريات"
            >
              <ShoppingBag className="h-5 w-5 text-foreground" />
              <span className="hidden sm:inline text-xs font-bold text-foreground">السلة</span>
              {itemCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-whatsapp text-[11px] font-extrabold text-whatsapp-foreground shadow-sm animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Direct WhatsApp Action */}
            <a
              href={generalContactLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-xl bg-whatsapp px-4 py-2.5 text-sm font-bold text-whatsapp-foreground shadow-md shadow-whatsapp/15 transition-all duration-200 hover:bg-whatsapp-hover hover:shadow-lg hover:shadow-whatsapp/25 active:scale-95 sm:inline-flex"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
              </span>
              <MessageCircle className="h-4 w-4" />
              <span>اطلب على واتساب</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              aria-label="القائمة"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-border/60 bg-muted/30 transition-colors hover:bg-muted md:hidden active:scale-95"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden animate-in slide-in-from-top-3 duration-200">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-bold transition-colors hover:bg-muted"
                >
                  <span>{link.label}</span>
                  {link.badge ? (
                    <span className="rounded-full bg-sale/20 px-2.5 py-0.5 text-xs font-bold text-sale">
                      {link.badge}
                    </span>
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                  )}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-border/50">
                <a
                  href={generalContactLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp py-3.5 text-sm font-bold text-whatsapp-foreground shadow-md active:scale-95"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>تحدث معنا فوراً على واتساب</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}

