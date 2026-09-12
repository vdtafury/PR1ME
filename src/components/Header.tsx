import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { useCartStore } from "@/lib/store";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/products", search: { q: searchQuery.trim() } });
    }
  };

  const navLinks = [
    { label: "جميع المنتجات", href: "/products" },
    { label: "هوديز", href: "/products", search: { category: "hoodies" } },
    { label: "تيشيرتات", href: "/products", search: { category: "t-shirts" } },
    { label: "أكسسوارات", href: "/products", search: { category: "accessories" } },
    { label: "تواصل معنا", href: "/about" },
    { label: "تتبع طلبك", href: "/about", hasDot: true },
  ];

  return (
    <div className="sticky top-0 z-40 flex flex-col bg-[#F7F7F5]">
      <AnnouncementBar />
      <header className="border-b border-[#E5E5E0] bg-[#F7F7F5] py-3.5 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo - Far Right in RTL */}
          <Link to="/" className="flex flex-col items-start select-none">
            <span className="text-2xl font-black tracking-tight text-[#0D0D0D] font-mono leading-none">
              PR1ME
            </span>
            <span className="mt-1 text-[8px] font-bold tracking-[0.25em] text-[#6B6B66] uppercase leading-none">
              WEAR YOUR STORY
            </span>
          </Link>

          {/* Center Navigation Links - Desktop */}
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
                {link.hasDot && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B2E2E]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Left Actions - Search, User, Cart (Far Left in RTL) */}
          <div className="flex items-center gap-3">
            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="relative hidden sm:block w-48 md:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتجك المفضل..."
                className="w-full rounded-xs border border-[#E5E5E0] bg-white py-1.5 pr-8 pl-3 text-xs text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6B66]" />
            </form>

            {/* User Icon */}
            <Link
              to="/about"
              className="grid h-8 w-8 place-items-center text-[#0D0D0D] hover:text-[#6B6B66] transition-colors"
              aria-label="حسابي"
            >
              <User className="h-4 w-4" />
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative grid h-8 w-8 place-items-center text-[#0D0D0D] hover:text-[#6B6B66] transition-colors"
              aria-label="سلة المشتريات"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0D0D0D] text-[10px] font-black text-[#F7F7F5]">
                {itemCount}
              </span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="grid h-8 w-8 place-items-center text-[#0D0D0D] lg:hidden"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E5E5E0] bg-[#F7F7F5] px-4 py-3 lg:hidden animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتجك المفضل..."
                className="w-full rounded-xs border border-[#E5E5E0] bg-white py-2 pr-8 pl-3 text-xs text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B66]" />
            </form>

            <nav className="flex flex-col divide-y divide-[#E5E5E0]">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  search={link.search}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 text-xs font-semibold text-[#0D0D0D]"
                >
                  <span>{link.label}</span>
                  {link.hasDot && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8B2E2E]" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
