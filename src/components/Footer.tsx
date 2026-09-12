import { Link } from "@tanstack/react-router";
import { ArrowLeft, Instagram, Facebook, Youtube, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BRAND } from "@/lib/whatsapp";

export function Footer() {
  const [email, setEmail] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("شكراً لاشتراكك في نشرتنا البريدية!");
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-[#E5E5E0] bg-[#F7F7F5] pt-8 sm:pt-12 pb-8 text-[#0D0D0D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-12 pb-8">
          {/* Column 1: Brand (Far Right in RTL) */}
          <div className="md:col-span-3 flex flex-col items-start">
            <Link to="/" className="flex flex-col items-start select-none">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0D0D0D] font-mono leading-none">
                PR1ME
              </span>
              <span className="mt-1 text-[8px] font-bold tracking-[0.25em] text-[#6B6B66] uppercase leading-none">
                WEAR YOUR STORY
              </span>
            </Link>
            <p className="mt-3 sm:mt-4 text-xs text-[#6B6B66] leading-relaxed max-w-xs">
              أزياء كاجوال مستوحاة من الشارع المصري. خامات قطنية مريحة ومعاينة قبل الدفع.
            </p>
          </div>

          {/* Column 2: Help (Collapsible on Mobile, Open on Desktop) */}
          <div className="md:col-span-2 border-t sm:border-t-0 border-[#E5E5E0] pt-3 sm:pt-0">
            <button
              onClick={() => setHelpOpen((o) => !o)}
              className="flex w-full items-center justify-between py-1 sm:py-0 font-bold text-xs text-[#0D0D0D] sm:cursor-default"
            >
              <span>مساعدة</span>
              <ChevronDown
                className={`h-4 w-4 text-[#6B6B66] transition-transform sm:hidden ${
                  helpOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul
              className={`mt-2.5 sm:mt-3 space-y-2.5 text-xs text-[#6B6B66] ${
                helpOpen ? "block" : "hidden sm:block"
              }`}
            >
              <li>
                <Link to="/about" className="hover:text-[#0D0D0D] transition-colors py-1 block">
                  تتبع طلبك
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#0D0D0D] transition-colors py-1 block">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#0D0D0D] transition-colors py-1 block">
                  سياسة الاستبدال والإرجاع
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links (Collapsible on Mobile, Open on Desktop) */}
          <div className="md:col-span-2 border-t sm:border-t-0 border-[#E5E5E0] pt-3 sm:pt-0">
            <button
              onClick={() => setLinksOpen((o) => !o)}
              className="flex w-full items-center justify-between py-1 sm:py-0 font-bold text-xs text-[#0D0D0D] sm:cursor-default"
            >
              <span>روابط سريعة</span>
              <ChevronDown
                className={`h-4 w-4 text-[#6B6B66] transition-transform sm:hidden ${
                  linksOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul
              className={`mt-2.5 sm:mt-3 space-y-2.5 text-xs text-[#6B6B66] ${
                linksOpen ? "block" : "hidden sm:block"
              }`}
            >
              <li>
                <Link to="/products" className="hover:text-[#0D0D0D] transition-colors py-1 block">
                  جميع المنتجات
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-[#0D0D0D] transition-colors py-1 block">
                  العروض
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#0D0D0D] transition-colors py-1 block">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#0D0D0D] transition-colors py-1 block">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div className="md:col-span-5 border-t sm:border-t-0 border-[#E5E5E0] pt-4 sm:pt-0 flex flex-col items-start md:items-end">
            <div className="w-full max-w-sm">
              <h4 className="text-xs font-bold text-[#0D0D0D]">
                اشترك في نشرتنا البريدية
              </h4>
              <p className="mt-1 text-[11px] text-[#6B6B66]">
                كن أول من يعرف عن العروض والمنتجات الجديدة
              </p>

              {/* Newsletter Form with 44px min height */}
              <form onSubmit={handleSubscribe} className="mt-3 flex">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 rounded-r-xs border border-[#E5E5E0] bg-white px-3 py-2.5 text-xs text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none min-h-[44px]"
                />
                <button
                  type="submit"
                  aria-label="اشتراك"
                  className="flex min-h-[44px] w-12 items-center justify-center rounded-l-xs bg-[#0D0D0D] text-[#F7F7F5] hover:bg-[#1F1F1F] transition-colors active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </form>

              {/* Social Media with 44px touch targets */}
              <div className="mt-4 flex items-center gap-1 text-[#0D0D0D]">
                <a
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid h-11 w-11 place-items-center text-[#6B6B66] hover:text-[#0D0D0D] transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={BRAND.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex h-11 items-center px-2 text-xs font-bold text-[#6B6B66] hover:text-[#0D0D0D] transition-colors"
                >
                  TikTok
                </a>
                <a
                  href={BRAND.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="grid h-11 w-11 place-items-center text-[#6B6B66] hover:text-[#0D0D0D] transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="grid h-11 w-11 place-items-center text-[#6B6B66] hover:text-[#0D0D0D] transition-colors"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-[#E5E5E0] pt-4 text-center text-[10px] sm:text-[11px] text-[#6B6B66]">
          <p>© {new Date().getFullYear()} {BRAND.name} Apparel. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
