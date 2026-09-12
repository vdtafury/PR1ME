import { Link } from "@tanstack/react-router";
import { MessageCircle, Menu, X, ShoppingBag, ArrowUpRight } from "lucide-react";
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
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "الكتالوج والمنتجات", href: "/products" },
    { label: "العروض الخاصة", href: "/offers", badge: "تخفيضات" },
    { label: "عن البراند والشحن", href: "/about" },
  ];

  return (
    <div className="sticky top-0 z-40 flex flex-col">
      <AnnouncementBar />
      <header
        className={`w-full transition-all duration-200 ${
          scrolled
            ? "editorial-nav py-3 shadow-md shadow-black/30"
            : "border-b border-border bg-background/95 backdrop-blur-md py-4"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Wordmark & Tagline */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-foreground text-background font-black text-lg tracking-tighter">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-widest text-foreground font-mono uppercase">
                {BRAND.name}
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
                Apparel • Cairo
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative text-xs font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground py-1"
                activeProps={{
                  className: "text-foreground font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground",
                }}
              >
                {link.label}
                {link.badge && (
                  <span className="mr-1.5 inline-block rounded-xs bg-red-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-red-400">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Ordering Contact Button */}
            <a
              href={generalContactLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-sm border border-emerald-600/40 bg-emerald-950/30 px-3.5 py-2 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-900/40 hover:border-emerald-500/60 sm:inline-flex"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>طلب مباشر على واتساب</span>
            </a>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-9 items-center gap-2 rounded-sm border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              aria-label="سلة المشتريات"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">السلة</span>
              {itemCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-black text-background">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              aria-label="القائمة"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded-sm border border-border bg-card text-foreground transition-colors hover:bg-muted md:hidden"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background md:hidden animate-in slide-in-from-top-2 duration-150">
            <nav className="mx-auto flex max-w-7xl flex-col divide-y divide-border/60 px-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3.5 text-sm font-semibold text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="rounded-xs bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}

              <div className="py-4">
                <a
                  href={generalContactLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-600 py-3 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>تواصل لطلب أي قطعة عبر واتساب</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
