import { X, Minus, Plus, ShoppingBag, MessageCircle, ShieldCheck, ArrowRight, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice, generalContactLink } from "@/lib/whatsapp";
import { getShippingFee, generateOrderCode, ALL_GOVERNORATES, SHIPPING_RATES, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { supabase } from "@/integrations/supabase/client";
import { colorToHex } from "@/lib/colors";
import { resolveImageUrl } from "@/lib/images";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function CartDrawer() {
  const { isCartOpen, setCartOpen, items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [orderSuccess, setOrderSuccess] = useState<{
    code: string;
    finalTotal: number;
    name: string;
    governorate: string;
    itemCount: number;
  } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("القاهرة");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close and reset
  const handleClose = () => {
    setCartOpen(false);
    setStep("cart");
    setOrderSuccess(null);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (isCartOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isCartOpen, handleClose]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setStep("cart");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = getShippingFee(governorate, subtotal);
  const isFreeShipping = shippingFee === 0;
  const finalTotal = subtotal + shippingFee;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

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
    const finalAmt = finalTotal;
    const gov = governorate;
    const clientName = name.trim();
    const count = items.length;

    // 1. Record order in Supabase
    try {
      const orderPayload = {
        order_code: orderCode,
        customer_name: clientName,
        phone: phone.trim(),
        governorate: gov,
        address: address.trim(),
        notes: notes.trim() || null,
        items: items.map((item) => ({
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
          product_code: item.product.product_code || null,
          image: item.product.main_image || null,
        })),
        subtotal,
        shipping_fee: shippingFee,
        total: finalAmt,
        status: "جديد",
      };

      const { error: dbError } = await supabase.from("orders").insert([orderPayload]);
      if (dbError) {
        console.warn("Could not insert cart order into Supabase:", dbError.message);
        toast.error("تعذر حفظ الطلب في قاعدة البيانات: " + dbError.message);
        setIsSubmitting(false);
        return;
      }

      clearCart();
      setOrderSuccess({
        code: orderCode,
        finalTotal: finalAmt,
        name: clientName,
        governorate: gov,
        itemCount: count,
      });
      setStep("success");
      toast.success(`تم استلام طلبك بنجاح! كود الطلب: #${orderCode}`);
    } catch (err: any) {
      console.warn("DB insert error caught:", err);
      toast.error("حدث خطأ أثناء حفظ الطلب، يرجى المحاولة ثانية");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Mobile Drawer (100dvh for mobile address bar safety) */}
      <div className="fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-full sm:max-w-md flex-col bg-white shadow-2xl border-r border-[#E5E5E0] animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E0] p-3.5 sm:p-4">
          <div className="flex items-center gap-2">
            {step === "checkout" ? (
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="grid h-8 w-8 place-items-center text-[#0D0D0D] hover:bg-black/5 rounded-xs"
                title="العودة للسلة"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : step === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <ShoppingBag className="h-4 w-4 text-[#0D0D0D]" />
            )}
            <h2 className="text-sm font-bold text-[#0D0D0D]">
              {step === "cart"
                ? "سلة المشتريات"
                : step === "checkout"
                ? "بيانات الشحن والتوصيل"
                : "تأكيد الطلب"}
            </h2>
            {step === "cart" && (
              <span className="text-xs text-[#6B6B66] font-mono">({items.length})</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="grid h-10 w-10 place-items-center text-[#6B6B66] hover:text-[#0D0D0D]"
            aria-label="إغلاق السلة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator (Cart Mode) */}
        {step === "cart" && (
          <div className="border-b border-[#E5E5E0] bg-[#F7F7F5] px-3.5 sm:px-4 py-2 text-[11px]">
            <div className="flex items-center justify-between text-[#6B6B66]">
              {remainingForFreeShipping > 0 ? (
                <span>
                  أضف بـ <strong className="text-[#0D0D0D] font-mono">{formatPrice(remainingForFreeShipping)}</strong> للشحن المجاني
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">مؤهل للشحن المجاني!</span>
              )}
              <span className="font-mono font-bold text-[#0D0D0D]">{freeShippingPercent}%</span>
            </div>
            <div className="mt-1 h-1 w-full bg-[#E5E5E0] overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Drawer Body */}
        {step === "cart" ? (
          /* Step 1: Items List */
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 touch-scroll">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <ShoppingBag className="h-10 w-10 text-[#6B6B66]/30" />
                <div>
                  <p className="text-sm font-bold text-[#0D0D0D]">السلة فارغة حالياً</p>
                  <p className="mt-1 text-xs text-[#6B6B66]">
                    تصفح الكتالوج وأضف ما يعجبك.
                  </p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="mt-3 min-h-[44px] bg-[#0D0D0D] px-6 py-2 text-xs font-bold text-[#F7F7F5]"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#E5E5E0]">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-3">
                    <div className="h-18 w-16 sm:h-20 sm:w-18 flex-shrink-0 overflow-hidden border border-[#E5E5E0] bg-[#F7F7F5]">
                      {item.product.main_image ? (
                        <img
                          src={resolveImageUrl(item.product.main_image)}
                          alt={item.product.title}
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.src = "/brand/hero-cairo-streetwear.jpg";
                          }}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[9px] text-[#6B6B66]">
                          PR1ME
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-1 text-xs font-bold text-[#0D0D0D]">
                            {item.product.title}
                          </h3>
                          {/* Remove button with 36px touch target */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="grid h-8 w-8 place-items-center text-[#6B6B66] hover:text-[#8B2E2E]"
                            title="حذف من السلة"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="price-display text-xs font-bold text-[#0D0D0D] mt-0.5">
                          {formatPrice(item.product.price)}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-[#6B6B66]">
                          {item.selectedSize && (
                            <span className="border border-[#E5E5E0] bg-[#F7F7F5] px-1.5 py-0.5 font-mono">
                              {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="flex items-center gap-1 border border-[#E5E5E0] bg-[#F7F7F5] px-1.5 py-0.5">
                              <span
                                className="h-2 w-2 rounded-full border border-black/30"
                                style={{ backgroundColor: colorToHex(item.selectedColor) }}
                              />
                              <span>{item.selectedColor}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper with 36px touch targets */}
                      <div className="mt-2 flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#6B6B66]">الكمية:</span>
                        <div className="flex items-center border border-[#E5E5E0] bg-[#F7F7F5]">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="grid h-8 w-8 place-items-center text-[#6B6B66] hover:text-[#0D0D0D]"
                            aria-label="تقليل الكمية"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="grid h-8 w-8 place-items-center text-[#6B6B66] hover:text-[#0D0D0D]"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Mobile Checkout Form */
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 touch-scroll space-y-3.5">
            {/* Order Summary Strip with Itemized Pricing */}
            <div className="border border-[#E5E5E0] bg-[#F7F7F5] p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0D0D0D]">ملخص الطلب:</span>
                  <p className="text-[11px] text-[#6B6B66]">{items.length} قطع مختلفة</p>
                </div>
                <span className="price-display text-sm font-bold text-[#0D0D0D]">
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

            <form id="checkout-form" onSubmit={handleFinalSubmit} className="space-y-3">
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
                  className="w-full min-h-[48px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-base sm:text-sm text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none"
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
                  className="w-full min-h-[48px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-base sm:text-sm text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none font-mono"
                />
              </div>

              {/* Governorate Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#0D0D0D] mb-1">
                  المحافظة (حساب الشحن التلقائي) <span className="text-[#8B2E2E]">*</span>
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full min-h-[48px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-base sm:text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none cursor-pointer"
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
                  className="w-full min-h-[48px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-sm text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none"
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
                  className="w-full min-h-[44px] rounded-xs border border-[#E5E5E0] bg-white px-3 text-sm text-[#0D0D0D] placeholder:text-[#6B6B66] focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success Confirmation View */}
        {step === "success" && orderSuccess && (
          <div className="flex-1 overflow-y-auto p-5 touch-scroll flex flex-col items-center text-center justify-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#0D0D0D]">
                تم استلام طلبك بنجاح! 🎉
              </h3>
              <p className="text-xs text-[#6B6B66] leading-relaxed max-w-xs">
                شكراً لتسوقك من <span className="font-bold text-[#0D0D0D]">PR1ME</span>. تم تسجيل بيانات الأوردر في نظامنا وجاري مراجعته وتجهيزه.
              </p>
            </div>

            {/* Order Code Badge */}
            <div className="w-full border border-[#E5E5E0] bg-[#F7F7F5] p-3.5 rounded-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B66] block mb-1">
                كود تتبع الطلب الخاص بك
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-[#0D0D0D] tracking-widest select-all">
                #{orderSuccess.code}
              </span>
            </div>

            {/* Order Details Recap */}
            <div className="w-full border border-[#E5E5E0] p-3.5 text-xs text-right space-y-2 bg-white rounded-xs">
              <div className="flex justify-between border-b border-[#E5E5E0] pb-2 text-[11px]">
                <span className="text-[#6B6B66]">العميل:</span>
                <span className="font-bold text-[#0D0D0D]">{orderSuccess.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#E5E5E0] pb-2 text-[11px]">
                <span className="text-[#6B6B66]">المحافظة:</span>
                <span className="font-bold text-[#0D0D0D]">{orderSuccess.governorate}</span>
              </div>
              <div className="flex justify-between border-b border-[#E5E5E0] pb-2 text-[11px]">
                <span className="text-[#6B6B66]">عدد المنتجات:</span>
                <span className="font-bold text-[#0D0D0D]">{orderSuccess.itemCount} قطع</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-[#0D0D0D]">المبلغ المطلوب عند الاستلام:</span>
                <span className="font-black font-mono text-base text-[#0D0D0D]">
                  {formatPrice(orderSuccess.finalTotal)}
                </span>
              </div>
            </div>

            {/* Shipping & Delivery Reassurance */}
            <div className="flex items-start gap-2 text-right border border-blue-100 bg-blue-50/50 p-3 text-[11px] text-blue-950 rounded-xs">
              <Truck className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                سيتواصل معك أحد ممثلي خدمة عملاء PR1ME هاتفياً لتأكيد العنوان وموعد خروج الشحنة مع المندوب. الدفع كاش عند الاستلام مع إمكانية المعاينة.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-2 flex min-h-[50px] w-full items-center justify-center gap-2 bg-[#0D0D0D] py-3 text-xs sm:text-sm font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98 cursor-pointer"
            >
              <span>متابعة التسوق</span>
            </button>
          </div>
        )}

        {/* Footer with Safe-Area Insets */}
        {step !== "success" && items.length > 0 && (
          <div className="border-t border-[#E5E5E0] bg-white p-3.5 sm:p-4 pb-safe space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="text-[#0D0D0D] font-bold">
                  {step === "cart" ? "إجمالي المنتجات:" : "الإجمالي عند الاستلام:"}
                </span>
                {step === "checkout" && (
                  <span className="text-[10px] text-[#6B6B66]">
                    {isFreeShipping ? "شامل الشحن المجاني" : `شامل مصاريف الشحن (${shippingFee} ج.م)`}
                  </span>
                )}
              </div>
              <span className="price-display text-lg sm:text-xl font-black text-[#0D0D0D]">
                {formatPrice(step === "cart" ? subtotal : finalTotal)}
              </span>
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-[#6B6B66] border border-[#E5E5E0] p-2 bg-[#F7F7F5]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                الدفع كاش عند الاستلام مع إمكانية المعاينة والقياس بحضور المندوب.
              </span>
            </div>

            {step === "cart" ? (
              <button
                onClick={() => setStep("checkout")}
                className="flex min-h-[50px] w-full items-center justify-center gap-2 bg-[#0D0D0D] py-3 text-xs font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98 cursor-pointer"
              >
                <span>متابعة إتمام الطلب (الدفع عند الاستلام)</span>
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 bg-[#0D0D0D] py-3 text-xs font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98 cursor-pointer disabled:opacity-75"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{isSubmitting ? "جاري تسجيل وتأكيد الطلب..." : "تأكيد وإتمام الطلب (الدفع عند الاستلام)"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
