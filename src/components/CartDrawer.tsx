import { X, Minus, Plus, ShoppingBag, MessageCircle, Truck, ShieldCheck, ArrowRight } from "lucide-react";
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

    let message = `مرحباً، أود تأكيد طلب المنتجات التالية من PR1ME:\n\n`;
    items.forEach((item, index) => {
      message += `▪️ *${index + 1}. ${item.product.title}*\n`;
      message += `   - الكمية: ${item.quantity}\n`;
      if (item.selectedSize) message += `   - المقاس: ${item.selectedSize}\n`;
      if (item.selectedColor) message += `   - اللون: ${item.selectedColor}\n`;
      message += `   - السعر: ${formatPrice(item.product.price * item.quantity)}\n\n`;
    });
    message += `💰 *الإجمالي الكلي: ${formatPrice(total)}*\n`;
    message += `📍 طريقة الدفع: كاش عند الاستلام (مع المعاينة قبل الدفع)\n`;
    message += `\nبرجاء تأكيد الطلب وتحديد موعد التوصيل والعنوان. شكرًا!`;

    const url = generalContactLink(message);
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl border-r border-border/60 transition-transform animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border/60 p-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-foreground">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">سلة المشتريات</h2>
              <p className="text-xs text-muted-foreground">{items.length} منتجات في السلة</p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="إغلاق السلة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="border-b border-border/40 bg-muted/20 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-foreground">
              <Truck className="h-4 w-4 text-whatsapp" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  أضف بـ <strong className="text-whatsapp">{formatPrice(remainingForFreeShipping)}</strong> للحصول على شحن مجاني!
                </span>
              ) : (
                <span className="text-whatsapp font-bold">تهانينا! حصلت على شحن مجاني لطلبك 🎉</span>
              )}
            </span>
            <span className="text-muted-foreground font-mono">{freeShippingPercent}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-whatsapp transition-all duration-500"
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted/50 text-muted-foreground">
                <ShoppingBag className="h-8 w-8 opacity-40" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">سلة المشتريات فارغة</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  تصفح أحدث تصاميمنا الكاجوال وأضف ما يعجبك.
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-xs font-bold text-background transition-transform hover:scale-105 active:scale-95"
              >
                <span>تصفح المنتجات الآن</span>
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 rounded-xl border border-border/50 bg-card p-3 transition-colors hover:border-border"
                >
                  <div className="h-22 w-18 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.product.main_image ? (
                      <img
                        src={item.product.main_image}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">
                        بدون صورة
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 text-sm font-bold text-foreground">
                          {item.product.title}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground transition-colors hover:text-destructive p-0.5"
                          title="حذف من السلة"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-sm font-black text-foreground">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        {item.selectedSize && (
                          <span className="rounded-md border border-border/80 bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                            المقاس: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                            <span
                              className="h-3 w-3 rounded-full border border-border"
                              style={{ backgroundColor: colorToHex(item.selectedColor) }}
                            />
                            <span>{item.selectedColor}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2">
                      <span className="text-xs text-muted-foreground font-semibold">الكمية:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-border/80 bg-muted/40 transition-colors hover:bg-muted active:scale-95"
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-border/80 bg-muted/40 transition-colors hover:bg-muted active:scale-95"
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

        {/* Drawer Footer & Checkout Guidance */}
        {items.length > 0 && (
          <div className="border-t border-border/60 bg-card/80 p-4 backdrop-blur-md sm:px-6">
            {/* Total */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground">الإجمالي التقريبي:</span>
              <span className="text-2xl font-black text-foreground">{formatPrice(total)}</span>
            </div>

            {/* Micro Guidance Box */}
            <div className="mb-3 rounded-xl border border-whatsapp/30 bg-whatsapp/10 p-3 text-xs text-foreground/90 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-whatsapp flex-shrink-0 mt-0.5" />
              <span>
                <strong>كيف يتم الطلب؟</strong> عند الضغط بالأسفل، سيتم فتح محادثة واتساب بتفاصيل قطعك لتأكيد العنوان وموعد الشحن. <strong>الدفع كاش عند الاستلام بعد المعاينة!</strong>
              </span>
            </div>

            {/* Order Action Button */}
            <button
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-whatsapp py-3.5 text-sm font-bold text-whatsapp-foreground shadow-lg shadow-whatsapp/20 transition-all hover:bg-whatsapp-hover hover:shadow-whatsapp/30 active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              <span>تأكيد وإتمام الطلب على واتساب</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

