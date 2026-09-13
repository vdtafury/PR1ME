import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Search,
  Package,
  CheckCircle2,
  Truck,
  ShieldCheck,
  XCircle,
  Clock,
  ArrowRight,
  Phone,
  MapPin,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice, generalContactLink } from "@/lib/whatsapp";
import { normalizePhone, phonesMatch } from "@/lib/phone";
import { toast } from "sonner";

const searchSchema = z.object({
  code: z.string().optional(),
  phone: z.string().optional(),
});

export const Route = createFileRoute("/track")({
  validateSearch: searchSchema,
  component: TrackOrderPage,
  head: () => ({
    meta: [
      { title: "تتبع شحنتك لحظة بلحظة — PR1ME" },
      {
        name: "description",
        content: "تابع خط سير وموعد وصول شحنتك من PR1ME بكود الطلب ورقم هاتفك بكل سهولة.",
      },
    ],
  }),
});

const STATUS_STEPS: { status: OrderStatus; label: string; description: string; icon: any }[] = [
  {
    status: "جديد",
    label: "تم استلام الطلب",
    description: "تم تسجيل الأوردر بنجاح في النظام وهو قيد المراجعة.",
    icon: Clock,
  },
  {
    status: "تم التأكيد",
    label: "تم التأكيد والتجهيز",
    description: "تمت مراجعة المقاسات وتغليف الشحنة وتجهيزها للشحن.",
    icon: CheckCircle2,
  },
  {
    status: "قيد الشحن",
    label: "قيد الشحن مع المندوب",
    description: "الشحنة خرجت مع شركة الشحن وفي طريقها إلى عنوانك.",
    icon: Truck,
  },
  {
    status: "تم التسليم",
    label: "تم التسليم بنجاح",
    description: "تم استلام الشحنة وتأكيد الدفع عند الاستلام. نتمنى لك تجربة ممتعة!",
    icon: ShieldCheck,
  },
];

function getStepIndex(status: OrderStatus): number {
  if (status === "ملغي") return -1;
  const idx = STATUS_STEPS.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

function TrackOrderPage() {
  const { code: initialCode, phone: initialPhone } = Route.useSearch();
  const [orderCode, setOrderCode] = useState(initialCode || "");
  const [phone, setPhone] = useState(initialPhone || "");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchOrder = async (searchCode: string, searchPhone: string) => {
    const cleanCode = searchCode.replace(/^#/, "").trim();
    const cleanPhone = normalizePhone(searchPhone);

    if (!cleanCode) {
      toast.error("يرجى إدخال كود الطلب (مثل PR1-1025)");
      return;
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // 1. Try secure RPC guest tracking function
      const { data: rpcData, error: rpcError } = await supabase.rpc("track_guest_order", {
        p_code: cleanCode,
        p_phone: cleanPhone,
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        setOrder(rpcData[0] as Order);
        setLoading(false);
        return;
      }

      // 2. Direct select fallback
      const { data: directData, error: directError } = await supabase
        .from("orders")
        .select("*")
        .or(`order_code.eq.${cleanCode},order_code.eq.#${cleanCode}`)
        .limit(5);

      if (directError) {
        throw directError;
      }

      if (directData && directData.length > 0) {
        const matched = directData.find((o: any) => phonesMatch(o.phone, cleanPhone));
        if (matched) {
          setOrder(matched as Order);
        } else {
          setOrder(null);
        }
      } else {
        setOrder(null);
      }
    } catch (err: any) {
      console.warn("Track order error:", err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if query params provided
  useEffect(() => {
    if (initialCode && initialPhone) {
      fetchOrder(initialCode, initialPhone);
    }
  }, [initialCode, initialPhone]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderCode, phone);
  };

  const copyOrderCode = () => {
    if (order?.order_code) {
      navigator.clipboard.writeText(`#${order.order_code}`);
      setCopied(true);
      toast.success("تم نسخ كود الطلب");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === "ملغي";

  return (
    <div className="min-h-screen bg-[#F7F7F5] py-8 sm:py-12" dir="rtl">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9B89A] block mb-1">
            PR1ME LIVE TRACKING
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0D0D0D]">
            تتبع شحنتك لحظة بلحظة
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#6B6B66] max-w-md mx-auto">
            أدخل كود الطلب ورقم هاتفك لمتابعة خط سير الشحنة ومعرفة موعد وصول المندوب.
          </p>
        </div>

        {/* Search Box */}
        <div className="border border-[#E5E5E0] bg-white p-5 sm:p-6 shadow-xs rounded-xs mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0D0D0D] mb-1.5">
                  كود الطلب (Order Code) <span className="text-[#8B2E2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  placeholder="مثال: PR1-8204"
                  className="w-full min-h-[46px] rounded-xs border border-[#E5E5E0] bg-[#F7F7F5] px-3 font-mono text-sm font-bold text-[#0D0D0D] placeholder:font-sans placeholder:text-xs placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D0D0D] mb-1.5">
                  رقم الهاتف المسجل به الطلب <span className="text-[#8B2E2E]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 01012345678"
                  className="w-full min-h-[46px] rounded-xs border border-[#E5E5E0] bg-[#F7F7F5] px-3 font-mono text-sm font-bold text-[#0D0D0D] placeholder:font-sans placeholder:text-xs placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#0D0D0D] py-3 text-xs sm:text-sm font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98 cursor-pointer disabled:opacity-75"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? "جاري البحث عن الشحنة..." : "تتبع حالة الطلب"}</span>
            </button>
          </form>
        </div>

        {/* Results Section */}
        {searched && !loading && !order && (
          <div className="border border-[#E5E5E0] bg-white p-8 text-center rounded-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-[#8B2E2E] mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0D0D0D]">لم يتم العثور على طلب بهذه البيانات</h3>
            <p className="mt-1 text-xs text-[#6B6B66] max-w-sm mx-auto leading-relaxed">
              يرجى التأكد من كتابة كود الطلب بصورة صحيحة (مثل <strong>PR1-1025</strong>) ورقم الهاتف المستخدم أثناء الشراء.
            </p>
          </div>
        )}

        {order && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Main Order Card */}
            <div className="border border-[#E5E5E0] bg-white rounded-xs overflow-hidden shadow-xs">
              {/* Header */}
              <div className="border-b border-[#E5E5E0] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-[#F7F7F5]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B6B66]">رقم الطلب:</span>
                  <span className="font-mono text-base sm:text-lg font-black text-[#0D0D0D]">
                    #{order.order_code}
                  </span>
                  <button
                    onClick={copyOrderCode}
                    className="grid h-7 w-7 place-items-center text-[#6B6B66] hover:text-[#0D0D0D] rounded hover:bg-black/5 transition-colors"
                    title="نسخ كود الطلب"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B6B66]">تاريخ الطلب:</span>
                  <span className="text-xs font-semibold text-[#0D0D0D]">
                    {new Date(order.created_at).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-4 sm:p-6 border-b border-[#E5E5E0]">
                {isCancelled ? (
                  <div className="flex items-center gap-3 border border-rose-200 bg-rose-50/70 p-4 rounded-xs text-rose-950">
                    <XCircle className="h-6 w-6 text-rose-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">تم إلغاء هذا الطلب</h4>
                      <p className="text-xs text-rose-800 mt-0.5">
                        تم إلغاء الطلب بناءً على رغبة العميل أو تعذر التواصل. إذا كان لديك استفسار يرجى التواصل مع الدعم.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[#6B6B66] block mb-0.5">
                          الحالة الحالية:
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-base sm:text-lg font-black text-[#0D0D0D]">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                          <span>{order.status}</span>
                        </span>
                      </div>
                      <span className="text-xs text-[#6B6B66] bg-[#F7F7F5] border border-[#E5E5E0] px-3 py-1.5 font-medium">
                        الدفع: كاش عند الاستلام
                      </span>
                    </div>

                    {/* Timeline Stepper */}
                    <div className="relative pt-4 pb-2">
                      <div className="grid grid-cols-4 gap-2 relative">
                        {/* Connecting background line */}
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E5E5E0] -z-0" />
                        {/* Active line */}
                        <div
                          className="absolute top-4 right-6 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
                          style={{
                            width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                          }}
                        />

                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          const Icon = step.icon;

                          return (
                            <div key={step.status} className="flex flex-col items-center text-center z-10">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  isDone
                                    ? "border-emerald-500 bg-emerald-500 text-white shadow-xs"
                                    : "border-[#E5E5E0] bg-white text-[#6B6B66]"
                                } ${isCurrent ? "ring-4 ring-emerald-500/20 scale-110" : ""}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <span
                                className={`mt-2 text-[10px] sm:text-xs font-bold leading-tight ${
                                  isDone ? "text-[#0D0D0D]" : "text-[#6B6B66]"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Current Step Description Card */}
                      <div className="mt-6 border border-[#E5E5E0] bg-[#F7F7F5] p-3.5 text-xs text-[#0D0D0D] rounded-xs flex items-start gap-2">
                        <Truck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          {STATUS_STEPS[currentStepIdx]?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items & Breakdown */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#0D0D0D] uppercase tracking-wider">
                    المنتجات المطلوبة ({order.items?.length || 0})
                  </h4>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {order.items?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between border border-[#E5E5E0] p-2.5 bg-[#F7F7F5] text-xs rounded-xs"
                      >
                        <div className="min-w-0 pr-1">
                          <span className="font-bold text-[#0D0D0D] block line-clamp-1">
                            {item.title}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B66] mt-0.5">
                            <span>الكمية: {item.quantity}</span>
                            {item.selectedSize && <span>• المقاس: {item.selectedSize}</span>}
                            {item.selectedColor && <span>• اللون: {item.selectedColor}</span>}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-[#0D0D0D] flex-shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Financial Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#0D0D0D] uppercase tracking-wider">
                    بيانات التوصيل والفاتورة
                  </h4>
                  <div className="border border-[#E5E5E0] p-3.5 space-y-2 text-xs bg-white rounded-xs">
                    <div className="flex justify-between border-b border-[#E5E5E0] pb-2 text-[11px]">
                      <span className="text-[#6B6B66]">المستلم:</span>
                      <span className="font-bold text-[#0D0D0D]">{order.customer_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E5E5E0] pb-2 text-[11px]">
                      <span className="text-[#6B6B66]">الهاتف:</span>
                      <span className="font-mono font-bold text-[#0D0D0D]">{order.phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E5E5E0] pb-2 text-[11px]">
                      <span className="text-[#6B6B66]">المحافظة والعنوان:</span>
                      <span className="font-bold text-[#0D0D0D] text-left max-w-[200px] line-clamp-1">
                        {order.governorate} — {order.address}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1">
                      <span className="text-[#6B6B66]">سعر المنتجات:</span>
                      <span className="font-mono">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#6B6B66]">مصاريف الشحن:</span>
                      <span className="font-mono">
                        {order.shipping_fee === 0 ? "شحن مجاني ✨" : formatPrice(order.shipping_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#E5E5E0] pt-2">
                      <span className="font-black text-[#0D0D0D]">الإجمالي عند الاستلام:</span>
                      <span className="font-mono text-base font-black text-[#0D0D0D]">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Account Link */}
              <div className="border-t border-[#E5E5E0] p-4 sm:p-5 bg-[#F7F7F5] flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={generalContactLink(`مرحباً PR1ME، بخصوص طلبي رقم #${order.order_code}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#0D0D0D] hover:text-[#6B6B66] transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>هل تحتاج تعديل موعد الشحن؟ تواصل مع الدعم عبر واتساب</span>
                </a>

                <Link
                  to="/account/login"
                  search={{
                    tab: "register",
                    phone: order.phone,
                    name: order.customer_name,
                    code: order.order_code,
                  }}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#0D0D0D] px-4 py-2 text-xs font-bold text-[#F7F7F5] hover:bg-[#1F1F1F] rounded-xs transition-colors"
                >
                  <span>أنشئ حسابك لحفظ هذا الطلب 🔐</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
