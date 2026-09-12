export function AnnouncementBar() {
  return (
    <div className="relative z-40 border-b border-border bg-card/60 py-2 text-[11px] font-medium text-muted-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-foreground font-semibold">شحن سريع لكافة محافظات مصر</span>
          <span className="hidden sm:inline text-border">•</span>
          <span className="hidden sm:inline">معاينة وقياس القطعة قبل الدفع</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-foreground">شحن مجاني للطلبات فوق 1,000 ج.م</span>
          <span className="hidden md:inline text-border">|</span>
          <span className="hidden md:inline text-muted-foreground">الدفع كاش عند الاستلام</span>
        </div>
      </div>
    </div>
  );
}
