import { X, Minus, Plus, ShoppingBag, MessageCircle, ShieldCheck, ArrowLeft } from "lucide-react";
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

  // Prevent body scroll when open
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
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl border-r border-border animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-foreground" />
            <h2 className="text-sm font-bold text-foreground">سلة المشتريات</h2>
            <span className="text-xs text-muted-foreground font-mono">({items.length})</span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="grid h-8 w-8 place-items-center border border-border text-muted-foreground hover:text-foreground"
            aria-label="إغلاق السلة"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Free Shipping Bar */}
        <div className="border-b border-border bg-card/40 px-4 py-2.5 sm:px-6 text-[11px]">
          <div className="flex items-center justify-between text-muted-foreground">
            {remainingForFreeShipping > 0 ? (
              <span>
                أضف بـ <strong className="text-foreground font-mono">{formatPrice(remainingForFreeShipping)}</strong> للحصول على شحن مجاني
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">مؤهل للشحن المجاني!</span>
            )}
            <span className="font-mono">{freeShippingPercent}%</span>
          </div>
          <div className="mt-1.5 h-1 w-full bg-border overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-bold text-foreground">السلة فارغة حالياً</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  تصفح الكتالوج وأضف ما يعجبك.
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-3 border border-border bg-foreground px-5 py-2.5 text-xs font-bold text-background"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3.5">
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden border border-border bg-muted">
                    {item.product.main_image ? (
                      <img
                        src={item.product.main_image}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[9px] text-muted-foreground">
                        PR1ME
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 text-xs font-bold text-foreground">
                          {item.product.title}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-red-400 p-0.5"
                          title="حذف من السلة"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="price-display text-xs font-bold text-foreground mt-0.5">
                        {formatPrice(item.product.price)}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                        {item.selectedSize && (
                          <span className="border border-border px-1.5 py-0.2 font-mono">
                            {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="flex items-center gap-1 border border-border px-1.5 py-0.2">
                            <span
                              className="h-2 w-2 rounded-full border border-black/30"
                              style={{ backgroundColor: colorToHex(item.selectedColor) }}
                            />
                            <span>{item.selectedColor}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">الكمية:</span>
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-foreground"
                          aria-label="تقليل"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-foreground"
                          aria-label="زيادة"
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border bg-card p-4 sm:px-6">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">الإجمالي:</span>
              <span className="price-display text-xl font-black text-foreground">
                {formatPrice(total)}
              </span>
            </div>

            <div className="mb-3 flex items-start gap-2 text-[11px] text-muted-foreground border border-border p-2 bg-background">
              <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>
                الدفع كاش عند الاستلام مع إمكانية المعاينة والقياس بحضور المندوب.
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2 bg-[#0D0D0D] py-3 text-xs font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98"
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
