import {
  Instagram,
  Facebook,
  MessageCircle,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { BRAND, generalContactLink } from "@/lib/whatsapp";
import { Link } from "@tanstack/react-router";

export function Footer() {
  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: "معاينة قبل الاستلام",
      desc: "قس القطعة وعاين الخامة قبل دفع أي مبلغ للمندوب",
    },
    {
      icon: Truck,
      title: "شحن سريع لكافة المحافظات",
      desc: "توصيل خلال 2 إلى 4 أيام عمل لجميع مدن مصر",
    },
    {
      icon: RotateCcw,
      title: "استبدال مقاس خلال 14 يوماً",
      desc: "مرونة تامة في تبديل المقاس عبر محادثة واتساب",
    },
    {
      icon: CheckCircle,
      title: "خامات قطنية 100% معالجة",
      desc: "ثبات في الألوان ومقاومة للانكماش مع الغسيل",
    },
  ];

  return (
    <footer className="mt-20 border-t border-border bg-card/20">
      {/* Service Guarantees Strip */}
      <div className="border-b border-border py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {trustFeatures.map((feat, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <feat.icon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-foreground">{feat.title}</h4>
                <p className="mt-0.5 text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        {/* Brand Bio */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-foreground text-background font-black text-base font-mono">
              P
            </div>
            <span className="text-base font-black tracking-widest text-foreground font-mono uppercase">
              {BRAND.name}
            </span>
          </div>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
            أزياء كاجوال مصرية يومية بتصاميم راقية وخامات قطنية منتقاة بعناية. اطلب قطعتك بسهولة عبر واتساب وادفع كاش بعد المعاينة والقياس.
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {BRAND.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {BRAND.hours}
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            المتجر
          </h4>
          <ul className="mt-3 space-y-2 text-xs">
            <li>
              <Link to="/products" className="text-muted-foreground hover:text-foreground">
                جميع المنتجات والكتالوج
              </Link>
            </li>
            <li>
              <Link to="/offers" className="text-muted-foreground hover:text-foreground">
                العروض والتخفيضات
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">
                عن البراند والشحن
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Support & Social */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            خدمة العملاء
          </h4>
          <div className="mt-3 space-y-2 text-xs">
            <a
              href={generalContactLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>محادثة فورية على واتساب</span>
            </a>
          </div>

          <div className="mt-5 flex gap-2">
            <a
              href={BRAND.instagram}
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-8 w-8 place-items-center border border-border text-muted-foreground hover:text-foreground hover:border-zinc-500"
            >
              <Instagram className="h-3.5 w-3.5" />
            </a>
            <a
              href={BRAND.facebook}
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-8 w-8 place-items-center border border-border text-muted-foreground hover:text-foreground hover:border-zinc-500"
            >
              <Facebook className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-border py-6 text-center text-[11px] text-muted-foreground">
        <p>© {new Date().getFullYear()} {BRAND.name} Apparel. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
