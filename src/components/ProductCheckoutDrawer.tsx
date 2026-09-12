import { X, MessageCircle, ShieldCheck, ArrowRight, Truck, CheckCircle2 } from "lucide-react";
import { formatPrice, generalContactLink } from "@/lib/whatsapp";
import { getShippingFee, generateOrderCode, ALL_GOVERNORATES, FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from "@/lib/shipping";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface ProductCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

export function ProductCheckoutDrawer({
  isOpen,
  onClose,
  product,
  quantity,
  selectedSize,
  selectedColor,
}: ProductCheckoutDrawerProps) {
  const [mounted, setMounted] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("القاهرة");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const subtotal = product.price * quantity;
  const shippingFee = getShippingFee(governorate, subtotal);
  const isFreeShipping = shippingFee === 0;
  const finalTotal = subtotal + shippingFee;

  // SSR mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Lock body & html scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg("يرجى إدخال الاسم بالكامل");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg("يرجى إدخال رقم هاتف صحيح (11 رقم)");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("يرجى كتابة العنوان التفصيلي لتسهيل التوصيل");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    const orderCode = generateOrderCode();

    // 1. Record order in Supabase
    try {
      const orderPayload = {
        order_code: orderCode,
        customer_name: name.trim(),
        phone: phone.trim(),
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
      }
    } catch (err) {
      console.warn("DB insert error caught:", err);
    } finally {
      setIsSubmitting(false);
    }

    // 2. Format Arabic WhatsApp message
    let message = `مرحباً PR1ME، أود تأكيد طلب أوردر جديد:\n`;
    message += `🔖 *كود الطلب: #${orderCode}*\n\n`;

    message += `👤 *بيانات العميل والتوصيل:*\n`;
    message += `▪️ الاسم: ${name.trim()}\n`;
    message += `▪️ الهاتف: ${phone.trim()}\n`;
    message += `▪️ المحافظة: ${governorate}\n`;
    message += `▪️ العنوان: ${address.trim()}\n`;
    if (notes.trim()) {
      message += `▪️ ملاحظات: ${notes.trim()}\n`;
    }

    message += `\n🛍️ *المنتج المطلوب:*\n`;
    message += `▪️ ${product.title}\n`;
    message += `   - الكمية: ${quantity}\n`;
    if (selectedSize) message += `   - المقاس: ${selectedSize}\n`;
    if (selectedColor) message += `   - اللون: ${selectedColor}\n`;
    if (product.product_code) message += `   - كود الموديل: ${product.product_code}\n`;
    message += `   - سعر القطعة: ${formatPrice(product.price)}\n`;

    message += `\n💰 *تفاصيل الحساب والفاتورة:*\n`;
    message += `▪️ سعر المنتجات: ${formatPrice(subtotal)}\n`;
    message += `▪️ مصاريف الشحن (${governorate}): ${
      isFreeShipping ? "شحن مجاني ✨ (أكثر من 1000 ج.م)" : formatPrice(shippingFee)
    }\n`;
    message += `▪️ *الإجمالي المطلوب عند الاستلام: ${formatPrice(finalTotal)}*\n`;

    message += `\n📍 طريقة الدفع: كاش عند الاستلام (مع المعاينة والقياس قبل الدفع)\n`;
    if (typeof window !== "undefined" && window.location.href) {
      message += `🔗 رابط المنتج: ${window.location.href}\n`;
    }
    message += `\nبرجاء تأكيد الطلب وتحديد موعد خروج الشحنة مع المندوب. شكراً!`;

    const url = generalContactLink(message);
    window.open(url, "_blank");
    toast.success(`تم تسجيل طلبك (#${orderCode}) وتجهيز رسالة واتساب!`);
    onClose();
  };

  const drawerElement = (
    <div className="fixed inset-0 z-[99999] pointer-events-auto select-auto" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className="fixed inset-y-0 left-0 flex h-[100dvh] max-h-[100dvh] w-full sm:max-w-md flex-col bg-white shadow-2xl border-r border-[#E5E5E0] animate-in slide-in-from-left duration-200 overscroll-contain z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        {/* Header (Always Fixed at Top) */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-[#E5E5E0] p-3.5 sm:p-4 bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center text-[#0D0D0D] hover:bg-black/5 rounded-xs transition-colors"
              title="إلغاء"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <h2 id="checkout-modal-title" className="text-sm font-bold text-[#0D0D0D]">
              بيانات الشحن والتوصيل
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center text-[#6B6B66] hover:text-[#0D0D0D] hover:bg-black/5 rounded-xs transition-colors"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 touch-scroll overscroll-contain space-y-3.5">
          {/* Order Summary Strip with Itemized Pricing */}
          <div className="border border-[#E5E5E0] bg-[#F7F7F5] p-3 text-xs space-y-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 pr-1">
                <span className="font-bold text-[#0D0D0D] block">ملخص الطلب:</span>
                <p className="text-[11px] text-[#6B6B66] line-clamp-1 mt-0.5 font-medium">
                  {product.title}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] text-[#6B6B66]">
                  <span className="font-mono bg-white border border-[#E5E5E0] px-1.5 py-0.5 font-bold text-[#0D0D0D]">
                    الكمية: {quantity}
                  </span>
                  {selectedSize && (
                    <span className="border border-[#E5E5E0] bg-white px-1.5 py-0.5 font-mono font-bold text-[#0D0D0D]">
                      {selectedSize}
                    </span>
                  )}
                  {selectedColor && (
                    <span className="border border-[#E5E5E0] bg-white px-1.5 py-0.5 font-semibold text-[#0D0D0D]">
                      {selectedColor}
                    </span>
                  )}
                </div>
              </div>
              <span className="price-display text-sm font-bold text-[#0D0D0D] flex-shrink-0 mr-2">
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Bill Breakdown */}
            <div className="border-t border-[#E5E5E0] pt-2 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-[#6B6B66]">
                <span>سعر المنتجات:</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[#6B6B66]">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span>مصاريف الشحن ({governorate}):</span>
                </span>
                {isFreeShipping ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    شحن مجاني
                  </span>
                ) : (
                  <span className="font-mono text-[#0D0D0D] font-bold">
                    +{formatPrice(shippingFee)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="border border-[#8B2E2E]/30 bg-[#8B2E2E]/10 p-2.5 text-xs text-[#8B2E2E] font-semibold">
              {errorMsg}
            </div>
          )}

          <form id="product-checkout-form" onSubmit={handleFinalSubmit} className="space-y-3">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-bold text-[#0D0D0D] mb-1">
                الاسم بالكامل <span className="text-[#8B2E2E]">*</span>
              </label>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: محمود علي"
                className="w-full min-h-[48px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-base sm:text-sm text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none transition-colors"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-xs font-bold text-[#0D0D0D] mb-1">
                رقم الهاتف للتواصل وتأكيد الشحن <span className="text-[#8B2E2E]">*</span>
              </label>
              <input
                type="tel"
                inputMode="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full min-h-[48px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-base sm:text-sm text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none font-mono transition-colors"
              />
            </div>

            {/* Governorate Dropdown with Live Rate Display */}
            <div>
              <label className="block text-xs font-bold text-[#0D0D0D] mb-1">
                المحافظة (حساب الشحن التلقائي) <span className="text-[#8B2E2E]">*</span>
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full min-h-[48px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-base sm:text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none transition-colors cursor-pointer"
              >
                {ALL_GOVERNORATES.map((g) => {
                  const rate = SHIPPING_RATES[g];
                  const label = isFreeShipping
                    ? `${g} (شحن مجاني ✨)`
                    : `${g} (شحن: ${rate} ج.م)`;
                  return (
                    <option key={g} value={g}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-xs font-bold text-[#0D0D0D] mb-1">
                العنوان التفصيلي <span className="text-[#8B2E2E]">*</span>
              </label>
              <input
                type="text"
                required
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="المنطقة، الشارع، رقم العمارة، رقم الشقة"
                className="w-full min-h-[48px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-base sm:text-sm text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none transition-colors"
              />
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-xs font-bold text-[#0D0D0D] mb-1">
                ملاحظات للمندوب (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: الاتصال قبل الوصول بنصف ساعة"
                className="w-full min-h-[44px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-base sm:text-sm text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none transition-colors"
              />
            </div>
          </form>
        </div>

        {/* Footer (Always Fixed at Bottom with Safe-Area for Mobile) */}
        <div className="flex-shrink-0 border-t border-[#E5E5E0] bg-white p-3.5 sm:p-4 pb-safe space-y-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex flex-col">
              <span className="text-[#0D0D0D] font-bold">الإجمالي عند الاستلام:</span>
              <span className="text-[10px] text-[#6B6B66]">
                {isFreeShipping ? "شامل الشحن المجاني" : `شامل مصاريف الشحن (${shippingFee} ج.م)`}
              </span>
            </div>
            <span className="price-display text-xl sm:text-2xl font-black text-[#0D0D0D]">
              {formatPrice(finalTotal)}
            </span>
          </div>

          <div className="flex items-start gap-1.5 text-[10px] text-[#6B6B66] border border-[#E5E5E0] p-2 bg-[#F7F7F5]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              الدفع كاش عند الاستلام مع إمكانية المعاينة والقياس بحضور المندوب.
            </span>
          </div>

          <button
            type="submit"
            form="product-checkout-form"
            disabled={isSubmitting}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 bg-[#0D0D0D] py-3 text-xs sm:text-sm font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98 cursor-pointer disabled:opacity-75"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            <span>
              {isSubmitting ? "جاري تسجيل الطلب..." : "تأكيد وإرسال الطلب على واتساب"}
            </span>
          </button>
        </div>
      </aside>
    </div>
  );

  return createPortal(drawerElement, document.body);
}
