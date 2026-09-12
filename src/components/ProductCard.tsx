import { Link } from "@tanstack/react-router";
import { ShoppingBag, Eye } from "lucide-react";
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
    <article className="group relative flex flex-col border border-border bg-card transition-colors hover:border-zinc-700">
      {/* Product Image Framing */}
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-muted"
      >
        {product.main_image ? (
          <div className="relative h-full w-full">
            <img
              src={product.main_image}
              alt={product.title}
              loading="lazy"
              className={`h-full w-full object-cover object-center transition-opacity duration-300 ${
                hasGallery ? "group-hover:opacity-0" : ""
              }`}
            />
            {hasGallery && gallery[0] && (
              <img
                src={gallery[0]}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </div>
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
            PR1ME
          </div>
        )}

        {/* Minimal retail badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          {hasSale && (
            <span className="rounded-xs bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              خصم {discountPercent}%
            </span>
          )}
          {product.is_featured && !hasSale && (
            <span className="rounded-xs border border-border bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-xs">
              مميّز
            </span>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Colors & Sizes Quick Preview */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-2">
          {product.sizes && product.sizes.length > 0 ? (
            <div className="flex items-center gap-1 font-mono">
              <span>{product.sizes.join(" • ")}</span>
            </div>
          ) : (
            <span className="text-[10px]">كاجوال يومي</span>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c}
                  title={c}
                  className="h-2.5 w-2.5 rounded-full border border-black/30"
                  style={{ backgroundColor: colorToHex(c) }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-1 text-sm font-bold text-foreground">
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="transition-colors hover:text-zinc-400"
          >
            {product.title}
          </Link>
        </h3>

        {/* Price display with tabular figures */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="price-display text-base font-extrabold text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasSale && (
            <span className="price-display text-xs text-muted-foreground line-through">
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>

        {/* Micro Guarantee Note */}
        <p className="mt-1 text-[10px] text-muted-foreground">
          معاينة وقياس القطعة متاح عند الاستلام
        </p>

        {/* Actions */}
        <div className="mt-3.5 flex items-center gap-1.5 pt-2 border-t border-border/60">
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
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xs border border-border bg-secondary py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted active:scale-98"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>أضف للسلة</span>
          </button>
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="grid h-8 w-8 place-items-center rounded-xs border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="عرض التفاصيل"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
