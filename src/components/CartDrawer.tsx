import { X, Minus, Plus, ShoppingBag, MessageCircle, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice, generalContactLink } from "@/lib/whatsapp";
import { colorToHex } from "@/lib/colors";
import { useEffect } from "react";

export function CartDrawer() {
  const { isCartOpen, setCartOpen, items, updateQuantity, removeItem } = useCartStore();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    if (isCartOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isCartOpen, setCartOpen]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 1000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total);
  const freeShippingPercent = Math.min(100, Math.round((total / freeShippingThreshold) * 100));

  const handleCheckout = () => {
    if (items.length === 0) return;

    let message = `مرحباً PR1ME، أود تأكيد طلب المنتجات التالية:\n\n`;
    items.forEach((item, index) => {
      message += `▪️ *${index + 1}. ${item.product.title}*\n`;
      message += `   - الكمية: ${item.quantity}\n`;
      if (item.selectedSize) message += `   - المقاس: ${item.selectedSize}\n`;
      if (item.selectedColor) message += `   - اللون: ${item.selectedColor}\n`;
      message += `   - السعر: ${formatPrice(item.product.price * item.quantity)}\n\n`;
    });
    message += `💰 *الإجمالي: ${formatPrice(total)}*\n`;
    message += `📍 طريقة الدفع: كاش عند الاستلام (مع المعاينة قبل الدفع)\n`;
    message += `\nبرجاء تأكيد الطلب وتحديد موعد الشحن. شكرًا!`;

    const url = generalContactLink(message);
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Mobile Drawer (100dvh for mobile address bar safety) */}
      <div className="fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-full sm:max-w-md flex-col bg-white shadow-2xl border-r border-[#E5E5E0] animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E0] p-3.5 sm:p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#0D0D0D]" />
            <h2 className="text-sm font-bold text-[#0D0D0D]">سلة المشتريات</h2>
            <span className="text-xs text-[#6B6B66] font-mono">({items.length})</span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="grid h-10 w-10 place-items-center text-[#6B6B66] hover:text-[#0D0D0D]"
            aria-label="إغلاق السلة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
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

        {/* Items List */}
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
                        src={item.product.main_image}
                        alt={item.product.title}
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

        {/* Footer with Safe-Area Insets */}
        {items.length > 0 && (
          <div className="border-t border-[#E5E5E0] bg-white p-3.5 sm:p-4 pb-safe space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B6B66]">الإجمالي:</span>
              <span className="price-display text-lg font-black text-[#0D0D0D]">
                {formatPrice(total)}
              </span>
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-[#6B6B66] border border-[#E5E5E0] p-2 bg-[#F7F7F5]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                الدفع كاش عند الاستلام مع إمكانية المعاينة والقياس بحضور المندوب.
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#0D0D0D] py-3 text-xs font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>تأكيد وإرسال الطلب على واتساب</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
