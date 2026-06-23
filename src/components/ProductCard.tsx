import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { formatPrice, productOrderLink } from "@/lib/whatsapp";
import { colorToHex } from "@/lib/colors";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/products/${product.slug}` : `/products/${product.slug}`;
  const hasSale = product.original_price && product.original_price > product.price;
  const gallery = product.gallery_images ?? [];
  const hasGallery = gallery.length > 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <Link to="/products/$slug" params={{ slug: product.slug }} className="relative block aspect-[4/5] overflow-hidden bg-muted">
        {product.main_image ? (
          <div className="h-full w-full relative">
            <img
              src={product.main_image}
              alt={product.title}
              loading="lazy"
              className={`h-full w-full object-cover transition-all duration-500 ${hasGallery ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
            />
            {hasGallery && gallery[0] && (
              <img
                src={gallery[0]}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </div>
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">No image</div>
        )}
        {hasSale && (
          <span className="absolute left-2 top-2 rounded bg-sale px-2 py-0.5 text-[11px] font-bold uppercase text-white shadow-sm z-10">Sale</span>
        )}
        {hasGallery && (
          <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 backdrop-blur-sm shadow-sm z-10">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            {gallery.length + 1} Images
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link to="/products/$slug" params={{ slug: product.slug }} className="line-clamp-1 text-sm font-semibold hover:underline">
          {product.title}
        </Link>
        {product.short_description && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{product.short_description}</p>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-extrabold text-price">{formatPrice(product.price)}</span>
          {hasSale && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.original_price!)}</span>
          )}
        </div>
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {product.sizes.map((s) => (
              <span key={s} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{s}</span>
            ))}
          </div>
        )}
        {product.colors && product.colors.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {product.colors.map((c) => (
              <span key={c} title={c} className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: colorToHex(c) }} />
            ))}
          </div>
        )}
        <div className="mt-1 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              import("@/lib/store").then((m) => {
                m.useCartStore.getState().addItem(product, 1, product.sizes?.[0], product.colors?.[0]);
              });
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            Add to Cart
          </button>
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="flex items-center justify-center rounded-md bg-muted px-3 py-2 text-xs font-semibold hover:bg-muted/80"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
