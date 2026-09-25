import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  AlertCircle,
  User,
  Phone,
  MapPin,
  FileText,
  RotateCcw,
  Sparkles,
  Check,
} from "lucide-react";
import {
  getShippingFee,
  generateOrderCode,
  ALL_GOVERNORATES,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_RATES,
} from "@/lib/shipping";
import { formatPrice } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

interface ProductInlineOrderFormProps {
  product: Product;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  onSelectSizeRequest?: () => void;
  onSelectColorRequest?: () => void;
}

export function ProductInlineOrderForm({
  product,
  quantity,
  selectedSize,
  selectedColor,
  onSelectSizeRequest,
  onSelectColorRequest,
}: ProductInlineOrderFormProps) {
  const navigate = useNavigate();

  // Form inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("القاهرة");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Validation & UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<{
    field?: "size" | "color" | "name" | "phone" | "address";
    message: string;
    solution: string;
  } | null>(null);

  // Financial calculations
  const subtotal = product.price * quantity;
  const shippingFee = getShippingFee(governorate, subtotal);
  const isFreeShipping = shippingFee === 0;
  const finalTotal = subtotal + shippingFee;

  // Real-time phone check
  const cleanPhone = phone.replace(/[\s-]/g, "");
  const isPhoneValid =
    cleanPhone.length === 11 &&
    (cleanPhone.startsWith("010") ||
      cleanPhone.startsWith("011") ||
      cleanPhone.startsWith("012") ||
      cleanPhone.startsWith("015"));

  const needsColor = (product.colors?.length ?? 0) > 0;
  const needsSize = (product.sizes?.length ?? 0) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Check Size Selection
    if (needsSize && !selectedSize) {
      setFormError({
        field: "size",
        message: "لم يتم تحديد المقاس المطلوب",
        solution: "اضغط على المقاس المناسب لك في الأعلى (M, L, XL, ...) قبل إرسال الطلب.",
      });
      if (onSelectSizeRequest) onSelectSizeRequest();
      toast.error("يرجى اختيار المقاس أولاً");
      return;
    }

    // 2. Check Color Selection
    if (needsColor && !selectedColor) {
      setFormError({
        field: "color",
        message: "لم يتم تحديد اللون المطلوب",
        solution: "اضغط على اللون المفضل لك من قائمة الألوان في الأعلى.",
      });
      if (onSelectColorRequest) onSelectColorRequest();
      toast.error("يرجى اختيار اللون أولاً");
      return;
    }

    // 3. Check Name
    if (!name.trim() || name.trim().length < 3) {
      setFormError({
        field: "name",
        message: "الاسم بالكامل غير مكتمل",
        solution: "اكتب اسمك الثنائي أو الثلاثي لتسجيل الفاتورة وتسليم الشحنة باسمك.",
      });
      document.getElementById("order-input-name")?.focus();
      toast.error("يرجى إدخال اسمك بالكامل");
      return;
    }

    // 4. Check Phone
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError({
        field: "phone",
        message: "رقم الموبايل غير صحيح أو ناقص",
        solution: "أدخل رقم تليفون صحيح مكون من 11 رقم يبدأ بـ (010 أو 011 أو 012 أو 015) ليتواصل المندوب معك قبل التوصيل.",
      });
      document.getElementById("order-input-phone")?.focus();
      toast.error("يرجى إدخال رقم تليفون صحيح (11 رقم)");
      return;
    }

    // 5. Check Address
    if (!address.trim() || address.trim().length < 5) {
      setFormError({
        field: "address",
        message: "العنوان غير محدد بالتفصيل",
        solution: "اكتب المنطقة، اسم الشارع، رقم العمارة أو علامة مميزة بجوارك لتسهيل وصول المندوب.",
      });
      document.getElementById("order-input-address")?.focus();
      toast.error("يرجى كتابة عنوان التوصيل بالتفصيل");
      return;
    }

    // Clear previous errors and start submission
    setFormError(null);
    setIsSubmitting(true);

    const orderCode = generateOrderCode();

    try {
      const orderPayload = {
        order_code: orderCode,
        customer_name: name.trim(),
        phone: cleanPhone,
        governorate,
        address: address.trim(),
        notes: notes.trim() || null,
        items: [
          {
            title: product.title,
            price: product.price,
            quantity,
            selectedSize: selectedSize || null,
            selectedColor: selectedColor || null,
            product_code: product.product_code || null,
            image: product.main_image || null,
          },
        ],
        subtotal,
        shipping_fee: shippingFee,
        total: finalTotal,
        status: "جديد",
      };

      const { error: dbError } = await supabase.from("orders").insert([orderPayload]);

      if (dbError) {
        console.warn("Could not insert order into Supabase:", dbError.message);
        toast.error("تعذر حفظ الطلب في قاعدة البيانات: " + dbError.message);
        setIsSubmitting(false);
        return;
      }

      toast.success(`تم استلام طلبك بنجاح! كود الطلب: #${orderCode}`);

      // Smooth navigate to the dedicated order success confirmation page
      navigate({
        to: "/order-success",
        search: {
          code: orderCode,
          phone: cleanPhone,
          name: name.trim(),
          gov: governorate,
          total: finalTotal,
        },
      });
    } catch (err: any) {
      console.error("Order submission error caught:", err);
      toast.error("حدث خطأ أثناء حفظ الطلب، يرجى المحاولة ثانية");
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="order-form"
      className="mt-6 scroll-mt-20 rounded-xl border border-[#E5E5E0] bg-white p-4 sm:p-6 shadow-xs"
      dir="rtl"
    >
      {/* Header */}
      <div className="border-b border-[#E5E5E0] pb-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#0D0D0D]">
            بيانات الشحن والتوصيل (الدفع عند الاستلام)
          </span>
          <span className="text-[11px] text-[#6B6B66]">
            التوصيل خلال 2 - 4 أيام عمل
          </span>
        </div>
        <p className="mt-1 text-xs text-[#6B6B66] leading-relaxed">
          يرجى إدخال بياناتك بدقة لتأكيد وتسليم الشحنة. الدفع نقداً عند استلام ومعاينة القطعة.
        </p>
      </div>

      {/* Selected Items Quick Recap on Top of Form */}
      <div className="my-4 rounded-lg border border-[#E5E5E0] bg-[#F7F7F5] p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0D0D0D] truncate max-w-[220px]">
            {product.title}
          </span>
          <span className="font-bold font-mono text-[#0D0D0D]">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          {needsSize && (
            <span
              className={`rounded px-2 py-0.5 font-semibold border ${
                selectedSize
                  ? "bg-white border-[#0D0D0D] text-[#0D0D0D]"
                  : "bg-white border-amber-300 text-amber-800 cursor-pointer"
              }`}
              onClick={!selectedSize ? onSelectSizeRequest : undefined}
            >
              المقاس: <strong>{selectedSize || "اختر المقاس"}</strong>
            </span>
          )}

          {needsColor && (
            <span
              className={`rounded px-2 py-0.5 font-semibold border ${
                selectedColor
                  ? "bg-white border-[#0D0D0D] text-[#0D0D0D]"
                  : "bg-white border-amber-300 text-amber-800 cursor-pointer"
              }`}
              onClick={!selectedColor ? onSelectColorRequest : undefined}
            >
              اللون: <strong>{selectedColor || "اختر اللون"}</strong>
            </span>
          )}

          <span className="rounded bg-white border border-[#E5E5E0] px-2 py-0.5 text-[#6B6B66]">
            الكمية: <strong className="text-[#0D0D0D]">{quantity}</strong>
          </span>
        </div>
      </div>

      {/* Form Error Banner with Direct Helpful Solution */}
      {formError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-950"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-bold text-rose-900">
                {formError.message}
              </strong>
              <p className="mt-1 text-[11px] leading-relaxed text-rose-800">
                <span className="font-semibold">توجيه:</span> {formError.solution}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label
            htmlFor="order-input-name"
            className="block text-xs font-bold text-[#0D0D0D] mb-1.5"
          >
            الاسم بالكامل <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6B6B66]">
              <User className="h-4 w-4" />
            </div>
            <input
              id="order-input-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (formError?.field === "name") setFormError(null);
              }}
              placeholder="مثال: أحمد محمد علي"
              className={`block w-full min-h-[48px] rounded-xl border pr-10 pl-3 text-xs sm:text-sm text-[#0D0D0D] placeholder:text-[#9E9E99] transition-all bg-white focus:outline-none focus:ring-2 ${
                formError?.field === "name"
                  ? "border-rose-400 focus:ring-rose-200"
                  : "border-[#E5E5E0] focus:border-[#0D0D0D] focus:ring-black/10"
              }`}
            />
          </div>
          <p className="mt-1 text-[10px] text-[#6B6B66]">
            يرجى كتابة اسمك الثنائي أو الثلاثي كما سيظهر على بوليصة الشحن.
          </p>
        </div>

        {/* Phone Input */}
        <div>
          <label
            htmlFor="order-input-phone"
            className="block text-xs font-bold text-[#0D0D0D] mb-1.5"
          >
            رقم الموبايل (واتساب للتأكيد) <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6B6B66]">
              <Phone className="h-4 w-4" />
            </div>
            <input
              id="order-input-phone"
              type="tel"
              inputMode="numeric"
              required
              dir="ltr"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (formError?.field === "phone") setFormError(null);
              }}
              placeholder="01012345678"
              className={`block w-full min-h-[48px] rounded-xl border pr-10 pl-3 text-left font-mono text-xs sm:text-sm text-[#0D0D0D] placeholder:text-[#9E9E99] transition-all bg-white focus:outline-none focus:ring-2 ${
                formError?.field === "phone"
                  ? "border-rose-400 focus:ring-rose-200"
                  : isPhoneValid
                  ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-100"
                  : "border-[#E5E5E0] focus:border-[#0D0D0D] focus:ring-black/10"
              }`}
            />
            {isPhoneValid && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px]">
            <span className="text-[#6B6B66]">
              يتكون من 11 رقم (010, 011, 012, 015)
            </span>
            {isPhoneValid && (
              <span className="text-emerald-700 font-semibold">رقم هاتف صالح</span>
            )}
          </div>
        </div>

        {/* Governorate Select */}
        <div>
          <label
            htmlFor="order-select-gov"
            className="block text-xs font-bold text-[#0D0D0D] mb-1.5"
          >
            المحافظة <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6B6B66]">
              <MapPin className="h-4 w-4" />
            </div>
            <select
              id="order-select-gov"
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              className="block w-full min-h-[48px] rounded-xl border border-[#E5E5E0] bg-white pr-10 pl-3 text-xs sm:text-sm text-[#0D0D0D] font-medium transition-all focus:border-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {ALL_GOVERNORATES.map((gov) => {
                const govFee = SHIPPING_RATES[gov] ?? 60;
                return (
                  <option key={gov} value={gov}>
                    {gov} {isFreeShipping ? "(شحن مجاني)" : `(شحن: ${formatPrice(govFee)})`}
                  </option>
                );
              })}
            </select>
          </div>
          <p className="mt-1 text-[10px] text-[#6B6B66]">
            {isFreeShipping
              ? `طلبك مؤهل للشحن المجاني (أكثر من ${formatPrice(FREE_SHIPPING_THRESHOLD)}).`
              : "يتم احتساب سعر الشحن تلقائياً حسب المحافظة."}
          </p>
        </div>

        {/* Detailed Address */}
        <div>
          <label
            htmlFor="order-input-address"
            className="block text-xs font-bold text-[#0D0D0D] mb-1.5"
          >
            العنوان بالتفصيل <span className="text-rose-600">*</span>
          </label>
          <textarea
            id="order-input-address"
            rows={2}
            required
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (formError?.field === "address") setFormError(null);
            }}
            placeholder="المنطقة أو الحي، اسم الشارع، رقم العمارة، رقم الشقة، أو علامة مميزة قريبة منك..."
            className={`block w-full rounded-xl border p-3 text-xs sm:text-sm text-[#0D0D0D] placeholder:text-[#9E9E99] transition-all bg-white focus:outline-none focus:ring-2 ${
              formError?.field === "address"
                ? "border-rose-400 focus:ring-rose-200"
                : "border-[#E5E5E0] focus:border-[#0D0D0D] focus:ring-black/10"
            }`}
          />
          <p className="mt-1 text-[10px] text-[#6B6B66]">
            كتابة العنوان بدقة يضمن وصول المندوب لك بدون أي تأخير.
          </p>
        </div>

        {/* Optional Notes */}
        <div>
          <label
            htmlFor="order-input-notes"
            className="block text-xs font-semibold text-[#6B6B66] mb-1.5"
          >
            ملاحظات إضافية للمندوب (اختياري)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6B6B66]">
              <FileText className="h-4 w-4" />
            </div>
            <input
              id="order-input-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يفضل التوصيل بعد العصر، الاتصال قبل الحضور..."
              className="block w-full min-h-[44px] rounded-xl border border-[#E5E5E0] bg-white pr-10 pl-3 text-xs sm:text-sm text-[#0D0D0D] placeholder:text-[#9E9E99] transition-all focus:border-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        {/* Financial Calculation Box */}
        <div className="rounded-xl border border-[#E5E5E0] bg-[#F7F7F5] p-3.5 text-xs space-y-2">
          <div className="flex justify-between text-[#6B6B66]">
            <span>سعر المنتجات ({quantity} قطعة):</span>
            <span className="font-mono font-bold text-[#0D0D0D]">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-[#6B6B66]">
            <span>مصاريف الشحن ({governorate}):</span>
            <span className="font-mono font-bold text-[#0D0D0D]">
              {isFreeShipping ? (
                <span className="text-emerald-700 font-bold">شحن مجاني</span>
              ) : (
                formatPrice(shippingFee)
              )}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-[#E5E5E0] text-sm">
            <span className="font-bold text-[#0D0D0D]">الإجمالي المطلوب عند الاستلام:</span>
            <span className="font-bold font-mono text-base sm:text-lg text-[#0D0D0D]">
              {formatPrice(finalTotal)}
            </span>
          </div>
        </div>

        {/* Big Touch-Friendly Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 shadow-lg active:scale-98 cursor-pointer ${
            isSubmitting
              ? "bg-[#6B6B66] text-white cursor-wait"
              : "bg-[#0D0D0D] text-[#F7F7F5] hover:bg-[#1F1F1F] hover:shadow-xl shadow-black/15"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>جاري تسجيل وتأكيد طلبك...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>تأكيد الطلب (الدفع عند الاستلام)</span>
            </div>
          )}
        </button>

        {/* Guarantees Box */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-[#6B6B66] border-t border-[#E5E5E0] pt-3">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-[#0D0D0D]" />
            <span>معاينة قبل الدفع</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Truck className="h-4 w-4 text-[#0D0D0D]" />
            <span>شحن 2-4 أيام</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <RotateCcw className="h-4 w-4 text-[#0D0D0D]" />
            <span>تبديل مقاس 14 يوم</span>
          </div>
        </div>
      </form>
    </section>
  );
}
