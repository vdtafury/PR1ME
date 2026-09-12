import { Link } from "@tanstack/react-router";
import { ShoppingBag, Eye, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/whatsapp";
import { colorToHex } from "@/lib/colors";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const hasSale = product.original_price && product.original_price > product.price;
  const discountPercent = hasSale
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;
  const gallery = product.gallery_images ?? [];
  const hasGallery = gallery.length > 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1">
      {/* Product Image Area */}
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-muted/40"
      >
        {product.main_image ? (
          <div className="relative h-full w-full">
            <img
              src={product.main_image}
              alt={product.title}
              loading="lazy"
              className={`h-full w-full object-cover transition-all duration-700 ${
                hasGallery ? "group-hover:opacity-0" : "group-hover:scale-105"
              }`}
            />
            {hasGallery && gallery[0] && (
              <img
                src={gallery[0]}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </div>
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
            لا توجد صورة
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {hasSale && (
            <span className="rounded-full bg-sale px-2.5 py-0.5 text-[11px] font-black uppercase text-white shadow-md">
              خصم {discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="flex items-center gap-1 rounded-full badge-gold px-2 py-0.5 text-[10px] font-bold shadow-md">
              <Sparkles className="h-3 w-3" /> مميز
            </span>
          )}
        </div>

        {/* Gallery Count */}
        {hasGallery && (
          <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
            +{gallery.length + 1} صور
          </span>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-1 text-sm font-bold text-foreground transition-colors hover:text-whatsapp"
        >
          {product.title}
        </Link>

        {product.short_description && (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {product.short_description}
          </p>
        )}

        {/* Price Area */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-base font-extrabold text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasSale && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>

        {/* Sizes and Colors preview */}
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/40 pt-2 text-xs">
          {product.sizes && product.sizes.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                >
                  {s}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-[10px] text-muted-foreground">+{product.sizes.length - 4}</span>
              )}
            </div>
          ) : (
            <span />
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 3).map((c) => (
                <span
                  key={c}
                  title={c}
                  className="h-3.5 w-3.5 rounded-full border border-border shadow-xs"
                  style={{ backgroundColor: colorToHex(c) }}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{product.colors.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3.5 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              import("@/lib/store").then((m) => {
                m.useCartStore
                  .getState()
                  .addItem(product, 1, product.sizes?.[0], product.colors?.[0]);
                toast.success(`تمت إضافة "${product.title}" إلى السلة`);
              });
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-foreground py-2 text-xs font-bold text-background transition-all hover:bg-foreground/90 active:scale-95"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>أضف للسلة</span>
          </button>
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="grid h-8 w-8 place-items-center rounded-xl border border-border/80 bg-muted/30 transition-colors hover:bg-muted active:scale-95"
            aria-label="عرض التفاصيل"
          >
            <Eye className="h-3.5 w-3.5 text-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}

