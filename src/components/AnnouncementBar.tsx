import { Sparkles, Truck, ShieldCheck, Zap } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="relative z-50 overflow-hidden border-b border-border/40 bg-gradient-to-r from-background via-muted/40 to-background py-2 text-xs font-semibold text-foreground/90">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 text-center">
        <span className="hidden items-center gap-1.5 md:inline-flex text-muted-foreground">
          <Truck className="h-3.5 w-3.5 text-whatsapp" />
          شحن سريع لجميع أنحاء الجمهورية
        </span>
        <span className="hidden md:inline text-border">•</span>
        <span className="inline-flex items-center gap-1.5 text-foreground font-bold">
          <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
          عروض الموسم الجديد | شحن مجاني للطلبات فوق 1,000 ج.م
        </span>
        <span className="hidden md:inline text-border">•</span>
        <span className="hidden items-center gap-1.5 md:inline-flex text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-whatsapp" />
          معاينة قبل الاستلام ودفع كاش
        </span>
      </div>
    </div>
  );
}

