import {
  Instagram,
  Facebook,
  MessageCircle,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  RefreshCw,
  Award,
} from "lucide-react";
import { BRAND, generalContactLink } from "@/lib/whatsapp";
import { Link } from "@tanstack/react-router";

export function Footer() {
  const trustFeatures = [
    {
      icon: Truck,
      title: "شحن سريع لكافة المحافظات",
      desc: "توصيل آمن وسريع خلال 2 إلى 4 أيام عمل",
    },
    {
      icon: ShieldCheck,
      title: "معاينة قبل الدفع",
      desc: "افتح شحنتك وعاين الخامة قبل دفع أي مليم",
    },
    {
      icon: RefreshCw,
      title: "استبدال واسترجاع سهل",
      desc: "مرونة كاملة في تبديل المقاسات خلال 14 يوم",
    },
    {
      icon: Award,
      title: "أفضل جودة خامات وسعر",
      desc: "تصاميم كاجوال عصرية بأقمشة قطنية متينة",
    },
  ];

  return (
    <footer className="mt-24 border-t border-border/60 bg-gradient-to-b from-background via-muted/20 to-muted/40">
      {/* Trust Highlights Strip */}
      <div className="border-b border-border/50 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {trustFeatures.map((feat, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card/60 p-4 backdrop-blur-sm transition-transform hover:-translate-y-1"
            >
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-muted text-whatsapp">
                <feat.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{feat.title}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        {/* Brand Bio */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background font-black text-xl">
              P
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-foreground">{BRAND.name}</span>
              <p className="text-[11px] font-semibold text-muted-foreground">CASUAL APPAREL</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {BRAND.tagline} — علامتك الأولى للملابس الكاجوال العصرية في مصر. تصاميم يومية تناسب ذوقك مع سهولة الطلب المباشر عبر واتساب والدفع عند الاستلام.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={generalContactLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-whatsapp px-5 py-3 text-sm font-bold text-whatsapp-foreground shadow-md transition-transform hover:scale-105 hover:bg-whatsapp-hover active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>تحدث مع خدمة العملاء</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-foreground">روابط المتجر</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/products" className="text-muted-foreground transition-colors hover:text-foreground">
                جميع المنتجات والكتالوج
              </Link>
            </li>
            <li>
              <Link to="/offers" className="text-muted-foreground transition-colors hover:text-foreground">
                العروض والخصومات الخاصة
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                عن البراند وتفاصيل الشحن
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Hours */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-foreground">خدمة العملاء</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span>{BRAND.location}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span>{BRAND.hours}</span>
            </li>
          </ul>
          <div className="mt-5 flex gap-2.5">
            <a
              href={BRAND.instagram}
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-xl border border-border/80 bg-card/60 transition-colors hover:border-foreground hover:bg-muted"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={BRAND.facebook}
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-xl border border-border/80 bg-card/60 transition-colors hover:border-foreground hover:bg-muted"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={BRAND.tiktok}
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-xl border border-border/80 bg-card/60 font-black text-xs transition-colors hover:border-foreground hover:bg-muted"
            >
              TT
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-right">
          <span>© {new Date().getFullYear()} {BRAND.name} CASUAL APPAREL. جميع الحقوق محفوظة.</span>
          <span className="flex items-center gap-2 font-medium">
            <span>دفع آمن عند الاستلام</span>
            <span>•</span>
            <span>معاينة قبل الدفع</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

