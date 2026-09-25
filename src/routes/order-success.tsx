import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Truck,
  Copy,
  Check,
  ShoppingBag,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  MapPin,
  Calendar,
  HelpCircle,
  RotateCcw,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/lib/types";
import { formatPrice, generalContactLink } from "@/lib/whatsapp";
import { toast } from "sonner";

interface OrderSuccessSearchParams {
  code?: string;
  phone?: string;
  name?: string;
  gov?: string;
  total?: number;
}

export const Route = createFileRoute("/order-success")({
  validateSearch: (search: Record<string, unknown>): OrderSuccessSearchParams => {
    return {
      code: typeof search.code === "string" ? search.code : undefined,
      phone: typeof search.phone === "string" ? search.phone : undefined,
      name: typeof search.name === "string" ? search.name : undefined,
      gov: typeof search.gov === "string" ? search.gov : undefined,
      total: typeof search.total === "number" ? search.total : undefined,
    };
  },
  component: OrderSuccessPage,
  head: () => ({
    meta: [
      { title: "تم تأكيد طلبك بنجاح — PR1ME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function getTimelineDates(baseDate: Date) {
  const arabicMonths = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const formatShort = (d: Date) => {
    return `${arabicDays[d.getDay()]}، ${d.getDate()} ${arabicMonths[d.getMonth()]}`;
  };

  const formatWithTime = (d: Date) => {
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "م" : "ص";
    hours = hours % 12 || 12;
    return `${formatShort(d)} - ${hours}:${minutes} ${period}`;
  };

  const step1Date = formatWithTime(baseDate);
  const step2Date = "اليوم (خلال 30 إلى 60 دقيقة)";

  const tomorrow = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
  const step3Date = `غداً (${formatShort(tomorrow)})`;

  const deliveryStart = new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000);
  const deliveryEnd = new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000);
  const step4Date = `بين ${formatShort(deliveryStart)} و ${formatShort(deliveryEnd)}`;

  return { step1Date, step2Date, step3Date, step4Date };
}

function OrderSuccessPage() {
  const search = Route.useSearch();
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderCode = search.code || "";
  const customerPhone = search.phone || "";
  const orderDate = order?.created_at ? new Date(order.created_at) : new Date();
  const timelineDates = getTimelineDates(orderDate);

  useEffect(() => {
    async function loadOrder() {
      if (!orderCode) {
        setLoading(false);
        return;
      }

      try {
        const cleanCode = orderCode.replace(/^#/, "").trim();
        // Try to fetch order from Supabase
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .or(`order_code.eq.${cleanCode},order_code.eq.#${cleanCode}`)
          .maybeSingle();

        if (!error && data) {
          setOrder(data as unknown as Order);
        }
      } catch (err) {
        console.warn("Could not fetch order details for success page:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderCode]);

  const handleCopyCode = () => {
    const codeToCopy = order?.order_code || orderCode;
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    toast.success("تم نسخ كود الطلب بنجاح");
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = order?.customer_name || search.name || "عزيزنا العميل";
  const displayPhone = order?.phone || customerPhone;
  const displayGov = order?.governorate || search.gov || "";
  const displayTotal = order?.total || search.total || 0;
  const displayCode = order?.order_code || orderCode;

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-6 sm:py-12 overflow-x-hidden" dir="rtl">
      {/* Top Celebration Card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent p-5 sm:p-8 text-center shadow-xs">
        <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-8 ring-emerald-500/10 animate-in zoom-in duration-300">
          <CheckCircle2 className="h-9 w-9 sm:h-12 sm:w-12" />
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
          تم استلام طلبك وتأكيده في النظام
        </span>

        <h1 className="mt-3 text-2xl sm:text-3xl font-black text-[#0D0D0D]">
          شكراً لك، {displayName}! 🎉
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6B6B66] max-w-md mx-auto leading-relaxed">
          تم حفظ طلبك بنجاح وجاري مراجعته من فريق <strong className="text-[#0D0D0D]">PR1ME</strong>. لا داعي للقلق، الدفع كاش عند الاستلام بعد المعاينة والقياس.
        </p>

        {/* Order Code Highlight */}
        {displayCode && (
          <div className="mt-5 mx-auto max-w-sm rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B66] block">
              كود تتبع الطلب الخاص بك
            </span>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-black text-[#0D0D0D] tracking-wider select-all">
                #{displayCode.replace(/^#/, "")}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-[#F7F7F5] px-3 text-xs font-bold text-[#0D0D0D] hover:bg-[#E5E5E0] active:scale-95 transition-all"
                title="نسخ كود الطلب"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[#6B6B66]" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-[#6B6B66]">
              احتفظ بهذا الكود أو رقم هاتفك لتتبع شحنتك في أي وقت.
            </p>
          </div>
        )}
      </div>

      {/* Modern Detailed Timeline Section */}
      <div className="mt-6 rounded-2xl border border-[#E5E5E0] bg-white p-4 sm:p-7 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E0] pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-base sm:text-lg font-black text-[#0D0D0D]">
                المسار الزمني لتوصيل طلبك (Timeline)
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#6B6B66]">
              متابعة مباشرة ومجدولة لكافة مراحل معالجة وشحن وتوصيل شحنتك بالتواريخ والتفاصيل
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            <span>مدة التوصيل المعتادة: 2 - 4 أيام</span>
          </span>
        </div>

        {/* Vertical Stepper Timeline with Connecting Line */}
        <div className="relative space-y-7 pr-1 sm:pr-2">
          {/* Continuous Timeline Line */}
          <div className="absolute right-[19px] sm:right-[23px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-400 to-[#E5E5E0]" />

          {/* Step 1: Completed */}
          <div className="relative flex items-start gap-3.5 sm:gap-4">
            <div className="relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-4 ring-white">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 sm:p-4 text-right">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-black text-[#0D0D0D]">
                  1. تسجيل الطلب وحجز المنتجات
                </h3>
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  مكتمل الآن ✓
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                <span>{timelineDates.step1Date}</span>
              </div>

              <p className="mt-1.5 text-xs text-[#6B6B66] leading-relaxed">
                تم استقبال طلبك بنجاح في نظام <strong className="text-[#0D0D0D]">PR1ME</strong>، وحجز القطع في المستودع وإصدار كود الشحنة الرسمي <strong className="font-mono text-[#0D0D0D]">#{displayCode}</strong>.
              </p>

              <div className="mt-2.5 flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-md bg-white border border-emerald-200 px-2 py-0.5 text-emerald-900 font-medium">
                  📦 حجز مؤكد في المستودع
                </span>
                <span className="rounded-md bg-white border border-emerald-200 px-2 py-0.5 text-emerald-900 font-medium">
                  📍 مستودع الشحن: القاهرة
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: In Progress */}
          <div className="relative flex items-start gap-3.5 sm:gap-4">
            <div className="relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-4 ring-white animate-pulse">
              <PhoneCall className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="flex-1 rounded-xl border border-blue-400 bg-blue-50/60 p-3.5 sm:p-4 text-right">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-black text-[#0D0D0D]">
                  2. مراجعة وتأكيد البيانات هاتفياً أو عبر واتساب
                </h3>
                <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  الخطوة الحالية ⏳
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-blue-900">
                <Clock className="h-3.5 w-3.5 text-blue-700" />
                <span>{timelineDates.step2Date}</span>
              </div>

              <p className="mt-1.5 text-xs text-[#6B6B66] leading-relaxed">
                يقوم فريق التأكيد بمراجعة العنوان والمحافظة ({displayGov || "المحددة"}) لترتيب موعد خروج الشحنة والتأكد من تواجدك لاستلامها.
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px]">
                {displayPhone && (
                  <span className="rounded-md bg-white border border-blue-200 px-2 py-0.5 text-blue-900 font-medium">
                    📱 التواصل على الرقم: <strong className="font-mono" dir="ltr">{displayPhone}</strong>
                  </span>
                )}
                <span className="rounded-md bg-white border border-blue-200 px-2 py-0.5 text-blue-900 font-medium">
                  💬 رسالة واتساب أو مكالمة سريعة
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Upcoming */}
          <div className="relative flex items-start gap-3.5 sm:gap-4">
            <div className="relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-white border-2 border-amber-500 text-amber-600 shadow-xs ring-4 ring-white">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="flex-1 rounded-xl border border-[#E5E5E0] bg-[#F7F7F5] p-3.5 sm:p-4 text-right">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[#0D0D0D]">
                  3. الفحص الدقيق، التغليف الفاخر، وتسليم الشحنة لشركة الشحن
                </h3>
                <span className="rounded-full bg-amber-500/15 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  الموعد المتوقع
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6B6B66]">
                <Calendar className="h-3.5 w-3.5 text-[#0D0D0D]" />
                <span>{timelineDates.step3Date}</span>
              </div>

              <p className="mt-1.5 text-xs text-[#6B6B66] leading-relaxed">
                يتم فحص كل قطعة للتأكد من خلوها من أي عيوب ومطابقتها للمقاس، ثم توضع في التغليف المخصص لعلامة PR1ME وتسليمها لشركة الشحن السريع.
              </p>

              <div className="mt-2.5 flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-md bg-white border border-[#E5E5E0] px-2 py-0.5 text-[#6B6B66]">
                  🛡️ فحص ومطابقة المقاس
                </span>
                <span className="rounded-md bg-white border border-[#E5E5E0] px-2 py-0.5 text-[#6B6B66]">
                  📦 تغليف مقوى لحماية الملابس
                </span>
              </div>
            </div>
          </div>

          {/* Step 4: Final Step */}
          <div className="relative flex items-start gap-3.5 sm:gap-4">
            <div className="relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-white border-2 border-purple-600 text-purple-700 shadow-xs ring-4 ring-white">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="flex-1 rounded-xl border border-purple-200 bg-purple-50/40 p-3.5 sm:p-4 text-right">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-black text-[#0D0D0D]">
                  4. وصول المندوب لباب بيتك (المعاينة والقياس قبل الدفع)
                </h3>
                <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  المرحلة الختامية 🎁
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-purple-900">
                <Calendar className="h-3.5 w-3.5 text-purple-700" />
                <span>{timelineDates.step4Date}</span>
              </div>

              <p className="mt-1.5 text-xs text-[#6B6B66] leading-relaxed">
                يتصل بك المندوب مسبقاً قبل القدوم. يحق لك بالكامل فتح الشحنة وقياس القطعة والتأكد من الخامة والتقفيل قبل سداد أي مليم.
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white border border-purple-200 p-2.5 text-[11px]">
                <span className="font-bold text-[#0D0D0D]">
                  💵 المبلغ المطلوب كاش عند الاستلام:
                </span>
                <span className="font-black font-mono text-sm text-emerald-700">
                  {formatPrice(displayTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Summary Box */}
      <div className="mt-6 rounded-2xl border border-[#E5E5E0] bg-white p-4 sm:p-6 shadow-xs">
        <h2 className="text-sm sm:text-base font-bold text-[#0D0D0D] mb-3 flex items-center justify-between border-b border-[#E5E5E0] pb-3">
          <span>ملخص بيانات الطلب</span>
          {displayGov && (
            <span className="text-xs font-normal text-[#6B6B66] flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {displayGov}
            </span>
          )}
        </h2>

        {/* Items List if available */}
        {order?.items && Array.isArray(order.items) && order.items.length > 0 && (
          <div className="space-y-2.5 mb-4 border-b border-[#E5E5E0] pb-4">
            <span className="text-[11px] font-bold text-[#6B6B66]">المنتجات المطلوبة:</span>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-[#F7F7F5] p-2.5 rounded-lg text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-12 w-12 rounded-md object-contain bg-white border border-[#E5E5E0] p-1 flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-[#0D0D0D] truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#6B6B66] mt-0.5">
                      {item.selectedSize && <span>المقاس: <strong className="text-[#0D0D0D]">{item.selectedSize}</strong></span>}
                      {item.selectedColor && <span>اللون: <strong className="text-[#0D0D0D]">{item.selectedColor}</strong></span>}
                      <span>الكمية: {item.quantity}</span>
                    </div>
                  </div>
                </div>
                <span className="font-bold font-mono text-[#0D0D0D] flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-[#E5E5E0] pb-4">
          <div>
            <span className="text-[#6B6B66] block text-[11px]">اسم العميل:</span>
            <span className="font-bold text-[#0D0D0D]">{displayName}</span>
          </div>
          {displayPhone && (
            <div>
              <span className="text-[#6B6B66] block text-[11px]">رقم الهاتف:</span>
              <span className="font-bold font-mono text-[#0D0D0D]" dir="ltr">{displayPhone}</span>
            </div>
          )}
          {displayGov && (
            <div>
              <span className="text-[#6B6B66] block text-[11px]">المحافظة:</span>
              <span className="font-bold text-[#0D0D0D]">{displayGov}</span>
            </div>
          )}
          {order?.address && (
            <div>
              <span className="text-[#6B6B66] block text-[11px]">العنوان التفصيلي:</span>
              <span className="font-medium text-[#0D0D0D]">{order.address}</span>
            </div>
          )}
        </div>

        {/* Financial Recap */}
        <div className="mt-4 space-y-1.5 text-xs">
          {order?.subtotal !== undefined && order.subtotal > 0 && (
            <div className="flex justify-between text-[#6B6B66]">
              <span>قيمة المنتجات:</span>
              <span className="font-mono font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
          )}
          {order?.shipping_fee !== undefined && (
            <div className="flex justify-between text-[#6B6B66]">
              <span>مصاريف الشحن:</span>
              <span className="font-mono font-semibold">
                {order.shipping_fee === 0 ? "شحن مجاني 🎉" : formatPrice(order.shipping_fee)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-[#E5E5E0] text-sm">
            <span className="font-black text-[#0D0D0D]">المبلغ الإجمالي كاش عند الاستلام:</span>
            <span className="font-black font-mono text-lg text-emerald-700">
              {formatPrice(displayTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Direct Mobile Convenience */}
      <div className="mt-6 space-y-3">
        {/* Track Button */}
        {displayCode && (
          <Link
            to="/track"
            search={{ code: displayCode, phone: displayPhone }}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0D0D0D] py-3 text-xs sm:text-sm font-bold text-[#F7F7F5] transition-all hover:bg-[#1F1F1F] active:scale-98 shadow-md"
          >
            <Truck className="h-4 w-4 text-emerald-400" />
            <span>تتبع مسار شحنتك لحظة بلحظة 📦</span>
          </Link>
        )}

        {/* Account Save Prompt */}
        {displayPhone && (
          <div className="rounded-xl border border-[#E5E5E0] bg-[#F7F7F5] p-4 text-right space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D0D0D]">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>تود حفظ هذا الطلب في حسابك الخاص؟</span>
            </div>
            <p className="text-[11px] text-[#6B6B66] leading-relaxed">
              سجل حسابك مجاناً برقم الهاتف <strong className="font-mono text-[#0D0D0D]">{displayPhone}</strong> لمتابعة جميع طلباتك السابقة والقادمة وإعادة الطلب بضغطة زر.
            </p>
            <Link
              to="/account/login"
              search={{
                tab: "register",
                phone: displayPhone,
                name: displayName !== "عزيزنا العميل" ? displayName : undefined,
                code: displayCode,
              }}
              className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-[#0D0D0D] bg-white py-2 text-xs font-bold text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-colors"
            >
              <span>إنشاء حساب بالهاتف وحفظ الطلب 🔐</span>
            </Link>
          </div>
        )}

        {/* WhatsApp & Continue Shopping Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <a
            href={generalContactLink(`مرحباً PR1ME، بخصوص طلبي كود #${displayCode || ""}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-800 py-2.5 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>استفسار عبر واتساب</span>
          </a>

          <Link
            to="/products"
            className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#E5E5E0] bg-white py-2.5 text-xs font-bold text-[#0D0D0D] hover:bg-[#F7F7F5] transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>متابعة التسوق والكتالوج</span>
          </Link>
        </div>
      </div>

      {/* Safety & Satisfaction Guarantees */}
      <div className="mt-8 border-t border-[#E5E5E0] pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs text-[#6B6B66]">
        <div className="rounded-xl border border-[#E5E5E0] bg-white p-3.5">
          <ShieldCheck className="h-5 w-5 text-[#0D0D0D] mx-auto mb-1.5" />
          <h4 className="font-bold text-[#0D0D0D]">معاينة قبل الدفع</h4>
          <p className="text-[11px] mt-0.5">افتح الشحنة وقيس قبل دفع أي قرش</p>
        </div>
        <div className="rounded-xl border border-[#E5E5E0] bg-white p-3.5">
          <RotateCcw className="h-5 w-5 text-[#0D0D0D] mx-auto mb-1.5" />
          <h4 className="font-bold text-[#0D0D0D]">استبدال مجاني 14 يوم</h4>
          <p className="text-[11px] mt-0.5">تبديل المقاس متاح بسهولة وسرعة</p>
        </div>
        <div className="rounded-xl border border-[#E5E5E0] bg-white p-3.5">
          <PhoneCall className="h-5 w-5 text-[#0D0D0D] mx-auto mb-1.5" />
          <h4 className="font-bold text-[#0D0D0D]">دعم مستمر</h4>
          <p className="text-[11px] mt-0.5">فريقنا معك خطوة بخطوة حتى الاستلام</p>
        </div>
      </div>
    </div>
  );
}
