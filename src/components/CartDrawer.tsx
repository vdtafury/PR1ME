import { X, Minus, Plus, ShoppingBag } from "lucide-react";
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

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    let message = `مرحباً، أود طلب المنتجات التالية:\n\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.title}\n`;
      message += `الكمية: ${item.quantity}\n`;
      if (item.selectedSize) message += `المقاس: ${item.selectedSize}\n`;
      if (item.selectedColor) message += `اللون: ${item.selectedColor}\n`;
      message += `السعر: ${formatPrice(item.product.price * item.quantity)}\n\n`;
    });
    message += `الإجمالي: ${formatPrice(total)}\n`;
    
    const url = generalContactLink(message);
    window.open(url, "_blank");
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setCartOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl transition-transform sm:border-l border-border flex flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-bold">Your Cart</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{items.length}</span>
          </div>
          <button 
            onClick={() => setCartOpen(false)}
            className="rounded-md p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20" />
              <div>
                <p className="text-lg font-semibold">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">Looks like you haven't added anything yet.</p>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-border pb-4 last:border-0">
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.product.main_image && (
                      <img src={item.product.main_image} alt={item.product.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h3 className="line-clamp-1 text-sm font-semibold">{item.product.title}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-price">{formatPrice(item.product.price)}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      {item.selectedColor && (
                        <span className="flex items-center gap-1">
                          Color: 
                          <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: colorToHex(item.selectedColor) }} />
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="grid h-6 w-6 place-items-center rounded-md border border-border hover:bg-muted"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="grid h-6 w-6 place-items-center rounded-md border border-border hover:bg-muted"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border bg-muted/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold">Total</span>
              <span className="text-xl font-extrabold">{formatPrice(total)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-whatsapp px-4 py-3 font-bold text-whatsapp-foreground hover:bg-whatsapp-hover"
            >
              Order on WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
