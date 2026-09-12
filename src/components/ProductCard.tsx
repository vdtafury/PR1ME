import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/whatsapp";
import { colorToHex } from "@/lib/colors";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const hasSale = product.original_price && product.original_price > product.price;
  const discountPercent = hasSale
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const gallery = product.gallery_images ?? [];
  const hasGallery = gallery.length > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1, product.sizes?.[0], product.colors?.[0]);
    toast.success(`تمت إضافة "${product.title}" إلى السلة`);
  };

  return (
    <article className="group relative flex flex-col border border-[#E5E5E0] bg-white transition-all hover:border-[#0D0D0D]/40">
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F7F7F5]">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="relative block h-full w-full"
        >
          {product.main_image ? (
            <div className="relative h-full w-full">
              <img
                src={product.main_image}
                alt={product.title}
                loading="lazy"
                className={`h-full w-full object-contain object-center p-3 transition-opacity duration-300 ${
                  hasGallery ? "group-hover:opacity-0" : ""
                }`}
              />
              {hasGallery && gallery[0] && (
                <img
                  src={gallery[0]}
                  alt={product.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain object-center p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              )}
            </div>
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-[#6B6B66]">
              PR1ME
            </div>
          )}
        </Link>

        {/* Wishlist Heart Icon (Top Right in RTL) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
            toast.success(
              isWishlisted
                ? "تمت الإزالة من المفضلة"
                : `تمت إضافة "${product.title}" إلى المفضلة`
            );
          }}
          className="absolute top-2.5 right-2.5 z-10 grid h-7 w-7 place-items-center text-[#0D0D0D]/70 hover:text-[#0D0D0D] transition-colors"
          aria-label="إضافة للمفضلة"
        >
          <Heart
            className={`h-4 w-4 ${
              isWishlisted ? "fill-[#8B2E2E] text-[#8B2E2E]" : "stroke-[1.5]"
            }`}
          />
        </button>

        {/* Sale Badge if applicable */}
        {hasSale && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#8B2E2E] px-2 py-0.5 text-[9px] font-bold text-white uppercase">
            خصم {discountPercent}%
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-3.5 text-center">
        {/* Title */}
        <h3 className="line-clamp-1 text-xs font-semibold text-[#0D0D0D]">
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="hover:text-[#6B6B66] transition-colors"
          >
            {product.title}
          </Link>
        </h3>

        {/* Price */}
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <span className="price-display text-xs font-bold text-[#0D0D0D]">
            {formatPrice(product.price)}
          </span>
          {hasSale && (
            <span className="price-display text-[10px] text-[#6B6B66] line-through">
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>

        {/* Color Swatch Dots */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {product.colors && product.colors.length > 0 ? (
            product.colors.slice(0, 3).map((c) => (
              <span
                key={c}
                title={c}
                className="h-2.5 w-2.5 rounded-full border border-black/20"
                style={{ backgroundColor: colorToHex(c) }}
              />
            ))
          ) : (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-[#0D0D0D]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#6B6B66]" />
            </>
          )}
        </div>

        {/* Quick Add Button on Hover */}
        <div className="mt-3 pt-2 border-t border-[#E5E5E0]">
          <button
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-1.5 bg-[#0D0D0D] py-1.5 text-[11px] font-bold text-[#F7F7F5] transition-colors hover:bg-[#1F1F1F] active:scale-98"
          >
            <ShoppingBag className="h-3 w-3" />
            <span>أضف إلى السلة</span>
          </button>
        </div>
      </div>
    </article>
  );
}
