import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingBag, Menu, X, ArrowLeft, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { useCartStore } from "@/lib/store";
import { generalContactLink, BRAND } from "@/lib/whatsapp";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/products", search: { q: searchQuery.trim() } });
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "جميع المنتجات", href: "/products" },
    { label: "هوديز", href: "/products", search: { category: "hoodies" } },
    { label: "تيشيرتات", href: "/products", search: { category: "t-shirts" } },
    { label: "أكسسوارات", href: "/products", search: { category: "accessories" } },
    { label: "العروض والتخفيضات", href: "/offers", badge: "خصومات" },
    { label: "عن البراند والشحن", href: "/about" },
  ];

  return (
    <div className="sticky top-0 z-40 flex flex-col bg-[#F7F7F5]">
      <AnnouncementBar />
      <header className="border-b border-[#E5E5E0] bg-[#F7F7F5] py-2.5 sm:py-3.5 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6">
          {/* Brand Logo - Far Right in RTL */}
          <Link to="/" className="flex flex-col items-start select-none min-h-[44px] justify-center">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0D0D0D] font-mono leading-none">
              PR1ME
            </span>
            <span className="mt-1 text-[7px] sm:text-[8px] font-bold tracking-[0.25em] text-[#6B6B66] uppercase leading-none">
              WEAR YOUR STORY
            </span>
          </Link>

          {/* Center Navigation Links - Desktop Only */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                search={link.search}
                className="relative text-xs font-semibold text-[#0D0D0D] transition-colors hover:text-[#6B6B66] flex items-center gap-1.5 py-1"
                activeProps={{
                  className: "font-black text-[#0D0D0D]",
                }}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-xs bg-[#8B2E2E]/15 px-1.5 py-0.2 text-[9px] font-bold text-[#8B2E2E]">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Left Actions - Mobile & Desktop */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden md:block w-48 lg:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتجك المفضل..."
                className="w-full rounded-xs border border-[#E5E5E0] bg-white py-1.5 pr-8 pl-3 text-xs text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6B66]" />
            </form>

            {/* Mobile Search Toggle Button (44px touch target) */}
            <button
              onClick={() => setMobileSearchOpen((o) => !o)}
              className="grid h-11 w-11 place-items-center text-[#0D0D0D] hover:text-[#6B6B66] md:hidden"
              aria-label="البحث"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Cart Button (44px touch target) */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative grid h-11 w-11 place-items-center text-[#0D0D0D] hover:text-[#6B6B66]"
              aria-label="سلة المشتريات"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0D0D0D] px-1 text-[9px] font-black text-[#F7F7F5]">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger (44px touch target) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="grid h-11 w-11 place-items-center text-[#0D0D0D] lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {mobileSearchOpen && (
          <div className="border-t border-[#E5E5E0] bg-white px-3 py-2.5 md:hidden animate-in slide-in-from-top-1 duration-150">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو القسم أو الموديل..."
                className="w-full rounded-xs border border-[#E5E5E0] bg-[#F7F7F5] py-2 pr-9 pl-3 text-sm text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B66]" />
            </form>
          </div>
        )}
      </header>

      {/* Dedicated Full-Screen Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative mr-auto flex h-[100dvh] w-full max-w-xs flex-col bg-[#F7F7F5] shadow-2xl border-l border-[#E5E5E0] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5E0] p-4">
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-[#0D0D0D] font-mono leading-none">
                  PR1ME
                </span>
                <span className="mt-1 text-[8px] font-bold tracking-[0.25em] text-[#6B6B66] uppercase leading-none">
                  WEAR YOUR STORY
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-11 w-11 place-items-center text-[#0D0D0D] hover:bg-black/5 rounded-xs"
                aria-label="إغلاق القائمة"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Links List */}
            <nav className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-[#E5E5E0]/60">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  search={link.search}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[48px] items-center justify-between py-3 text-sm font-bold text-[#0D0D0D] active:text-[#6B6B66]"
                >
                  <span>{link.label}</span>
                  <div className="flex items-center gap-2">
                    {link.badge && (
                      <span className="rounded-xs bg-[#8B2E2E]/15 px-2 py-0.5 text-[10px] font-bold text-[#8B2E2E]">
                        {link.badge}
                      </span>
                    )}
                    <ArrowLeft className="h-4 w-4 text-[#6B6B66]" />
                  </div>
                </Link>
              ))}
            </nav>

            {/* Drawer Footer & Direct WhatsApp Support */}
            <div className="border-t border-[#E5E5E0] p-4 bg-white space-y-3 pb-safe">
              <a
                href={generalContactLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] w-full items-center justify-center gap-2 bg-[#0D0D0D] py-3 text-xs font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>طلب واستشارة فورية على واتساب</span>
              </a>

              <div className="text-center text-[10px] text-[#6B6B66]">
                <p>{BRAND.location}</p>
                <p className="mt-0.5">{BRAND.hours}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
