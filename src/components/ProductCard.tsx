import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/whatsapp";
import { colorToHex } from "@/lib/colors";
import { resolveImageUrl } from "@/lib/images";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHeartPop, setIsHeartPop] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
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
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
    toast.success(`تمت إضافة "${product.title}" إلى السلة`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    setIsHeartPop(true);
    setTimeout(() => setIsHeartPop(false), 260);
    toast.success(
      isWishlisted
        ? "تمت الإزالة من المفضلة"
        : `تمت إضافة "${product.title}" إلى المفضلة`
    );
  };

  return (
    <article className="group relative flex flex-col border border-[#E5E5E0] bg-white transition-colors hover:border-[#0D0D0D]/40">
      {/* Product Image Area - Editorial 4:5 Aspect Ratio */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7F7F5]">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="relative block h-full w-full"
        >
          {product.main_image ? (
            <div className="relative h-full w-full">
              <img
                src={resolveImageUrl(product.main_image)}
                alt={product.title}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = "/brand/hero-cairo-streetwear.jpg";
                }}
                className={`h-full w-full object-contain object-center p-2.5 sm:p-4 transition-opacity duration-300 ${
                  hasGallery ? "md:group-hover:opacity-0" : ""
                }`}
              />
              {hasGallery && gallery[0] && (
                <img
                  src={resolveImageUrl(gallery[0])}
                  alt={product.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = "/brand/hero-cairo-streetwear.jpg";
                  }}
                  className="hidden md:block absolute inset-0 h-full w-full object-contain object-center p-2.5 sm:p-4 opacity-0 transition-opacity duration-300 md:group-hover:opacity-100"
                />
              )}
            </div>
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-[#6B6B66]">
              PR1ME
            </div>
          )}
        </Link>

        {/* Wishlist Heart Icon - 40px Touch Target with Pop Animation */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-1 right-1 z-10 grid h-10 w-10 place-items-center text-[#0D0D0D]/80 hover:text-[#0D0D0D] transition-colors"
          aria-label="إضافة للمفضلة"
        >
          <div
            className={`grid h-7 w-7 place-items-center rounded-full bg-white/85 backdrop-blur-xs shadow-xs transition-transform ${
              isHeartPop ? "animate-heart-pop" : "active:scale-90"
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors duration-200 ${
                isWishlisted ? "fill-[#8B2E2E] text-[#8B2E2E]" : "stroke-[1.5]"
              }`}
            />
          </div>
        </button>

        {/* Sale Badge */}
        {hasSale && (
          <span className="absolute top-2 left-2 z-10 bg-[#8B2E2E] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase leading-none rounded-xs">
            خصم {discountPercent}%
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3 text-center">
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
        <div className="mt-1 flex items-center justify-center gap-1 sm:gap-1.5">
          <span className="price-display text-xs sm:text-sm font-black text-[#0D0D0D]">
            {formatPrice(product.price)}
          </span>
          {hasSale && (
            <span className="price-display text-[10px] text-[#6B6B66] line-through">
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>

        {/* Color Swatch Dots */}
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
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
              <span className="h-2 w-2 rounded-full bg-[#0D0D0D]" />
              <span className="h-2 w-2 rounded-full bg-[#6B6B66]" />
            </>
          )}
        </div>

        {/* Quick Add Button with Immediate Micro-Interaction Feedback */}
        <div className="mt-2.5 pt-2 border-t border-[#E5E5E0]">
          <button
            onClick={handleQuickAdd}
            className={`flex min-h-[38px] w-full items-center justify-center gap-1.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-98 ${
              isAdded
                ? "bg-[#1F1F1F] text-emerald-400"
                : "bg-[#0D0D0D] text-[#F7F7F5] hover:bg-[#1F1F1F]"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>تمت الإضافة ✓</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
