import { Link } from "@tanstack/react-router";
import { ArrowLeft, Instagram, Facebook, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BRAND } from "@/lib/whatsapp";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("شكراً لاشتراكك في نشرتنا البريدية!");
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-[#E5E5E0] bg-[#F7F7F5] pt-12 pb-8 text-[#0D0D0D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 pb-10">
          {/* Column 1: Brand & Copyright (Far Right in RTL) */}
          <div className="md:col-span-3 flex flex-col items-start">
            <Link to="/" className="flex flex-col items-start select-none">
              <span className="text-2xl font-black tracking-tight text-[#0D0D0D] font-mono leading-none">
                PR1ME
              </span>
              <span className="mt-1 text-[8px] font-bold tracking-[0.25em] text-[#6B6B66] uppercase leading-none">
                WEAR YOUR STORY
              </span>
            </Link>
            <p className="mt-6 text-[11px] text-[#6B6B66]">
              جميع الحقوق محفوظة. © {new Date().getFullYear()} {BRAND.name}
            </p>
          </div>

          {/* Column 2: Help / مساعدة */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-[#0D0D0D]">مساعدة</h4>
            <ul className="mt-3 space-y-2 text-xs text-[#6B6B66]">
              <li>
                <Link to="/about" className="hover:text-[#0D0D0D] transition-colors">
                  تتبع طلبك
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#0D0D0D] transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#0D0D0D] transition-colors">
                  سياسة الاستبدال والإرجاع
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links / روابط سريعة */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-[#0D0D0D]">روابط سريعة</h4>
            <ul className="mt-3 space-y-2 text-xs text-[#6B6B66]">
              <li>
                <Link to="/products" className="hover:text-[#0D0D0D] transition-colors">
                  جميع المنتجات
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-[#0D0D0D] transition-colors">
                  العروض
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#0D0D0D] transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#0D0D0D] transition-colors">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Social (Far Left in RTL) */}
          <div className="md:col-span-5 flex flex-col items-start md:items-end">
            <div className="w-full max-w-sm">
              <h4 className="text-xs font-bold text-[#0D0D0D]">
                اشترك في نشرتنا البريدية
              </h4>
              <p className="mt-1 text-[11px] text-[#6B6B66]">
                كن أول من يعرف عن العروض والمنتجات الجديدة
              </p>

              {/* Newsletter Form */}
              <form onSubmit={handleSubscribe} className="mt-3 flex">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 rounded-r-xs border border-[#E5E5E0] bg-white px-3 py-2 text-xs text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="اشتراك"
                  className="flex items-center justify-center rounded-l-xs bg-[#0D0D0D] px-3 text-[#F7F7F5] hover:bg-[#1F1F1F] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </form>

              {/* Social Media Icons */}
              <div className="mt-4 flex items-center gap-3 text-[#0D0D0D]">
                <a
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-[#6B6B66] hover:text-[#0D0D0D] transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={BRAND.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="text-xs font-bold text-[#6B6B66] hover:text-[#0D0D0D] transition-colors"
                >
                  TikTok
                </a>
                <a
                  href={BRAND.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-[#6B6B66] hover:text-[#0D0D0D] transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-[#6B6B66] hover:text-[#0D0D0D] transition-colors"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
