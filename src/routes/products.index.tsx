import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useState, useMemo, useEffect } from "react";
import { Filter, X, ArrowDownUp, RotateCcw, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { colorToHex } from "@/lib/colors";
import { formatPrice } from "@/lib/whatsapp";
import type { Category, Product } from "@/lib/types";

const search = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/products/")({
  validateSearch: search,
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "كتالوج المنتجات والملابس الكاجوال — PR1ME" },
      {
        name: "description",
        content:
          "تصفح تشكيلة PR1ME من التيشيرتات، الهوديز والملابس الكاجوال الرجالية في مصر. خامات قطنية ممتازة ومعاينة قبل الدفع.",
      },
      { property: "og:title", content: "كتالوج المنتجات — PR1ME" },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
});

function ProductsPage() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // Local filter state
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortOption, setSortOption] = useState<
    "recommended" | "newest" | "price_asc" | "price_desc"
  >("recommended");

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const current = categories.data?.find((c) => c.slug === category) ?? null;

  // Prevent body scroll when mobile filter sheet is open
  useEffect(() => {
    if (showFilters && typeof window !== "undefined" && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showFilters]);

  const productsQ = useQuery({
    queryKey: ["products", category ?? "all", q ?? ""],
    queryFn: async () => {
      let query = supabase.from("products").select("*").eq("is_available", true);
      if (current) query = query.eq("category_id", current.id);
      if (q) query = query.ilike("title", `%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });

  // Extract available sizes and colors
  const availableSizes = useMemo(() => {
    if (!productsQ.data) return [];
    const sizes = new Set<string>();
    productsQ.data.forEach((p) => p.sizes?.forEach((s) => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [productsQ.data]);

  const availableColors = useMemo(() => {
    if (!productsQ.data) return [];
    const colors = new Set<string>();
    productsQ.data.forEach((p) => p.colors?.forEach((c) => colors.add(c)));
    return Array.from(colors).sort();
  }, [productsQ.data]);

  // Client-side filtering and sorting
  const filteredProducts = useMemo(() => {
    if (!productsQ.data) return [];
    let result = [...productsQ.data];

    if (selectedSize) {
      result = result.filter((p) => p.sizes?.includes(selectedSize));
    }

    if (selectedColor) {
      result = result.filter((p) => p.colors?.includes(selectedColor));
    }

    result = result.filter((p) => p.price <= maxPrice);

    switch (sortOption) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "recommended":
      default:
        result.sort((a, b) => a.sort_order - b.sort_order);
        break;
    }

    return result;
  }, [productsQ.data, selectedSize, selectedColor, maxPrice, sortOption]);

  const resetFilters = () => {
    setSelectedSize(null);
    setSelectedColor(null);
    setMaxPrice(5000);
    setSortOption("recommended");
  };

  const hasActiveFilters = selectedSize || selectedColor || maxPrice < 5000 || sortOption !== "recommended";

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-10 overflow-x-hidden">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E5E0] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B66]">
            PR1ME STORE
          </span>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#0D0D0D]">
            {current ? current.name : "الكتالوج وجميع المنتجات"}
          </h1>
          <p className="mt-0.5 text-xs text-[#6B6B66]">
            عرض {filteredProducts.length} قطعة متوفرة
          </p>
        </div>

        {/* Action Controls with 44px touch target on mobile */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex min-h-[40px] items-center gap-1.5 border border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-[#6B6B66] hover:text-[#0D0D0D]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>إعادة ضبط</span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex min-h-[40px] items-center gap-2 border px-4 text-xs font-bold transition-colors ${
              showFilters
                ? "border-[#0D0D0D] bg-[#0D0D0D] text-[#F7F7F5]"
                : "border-[#E5E5E0] bg-white text-[#0D0D0D]"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>تصفية وترتيب</span>
            {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Horizontal Categories Bar - Smooth Touch Scrolling */}
      <div className="mt-3.5 flex gap-2 overflow-x-auto touch-scroll pb-2">
        <button
          onClick={() => navigate({ search: { q } })}
          className={chip(!category)}
        >
          الكل
        </button>
        {(categories.data ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => navigate({ search: { category: c.slug, q } })}
            className={chip(category === c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="mt-4 flex flex-col md:flex-row gap-6">
        {/* Filters Drawer / Bottom Sheet */}
        {showFilters && (
          <>
            {/* Mobile Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
              onClick={() => setShowFilters(false)}
            />

            <div className="fixed bottom-0 inset-x-0 z-50 max-h-[85dvh] overflow-y-auto border-t md:border border-[#E5E5E0] bg-white p-4 sm:p-5 md:static md:w-60 md:flex-shrink-0 md:bg-white pb-safe animate-in slide-in-from-bottom-4 md:animate-none">
              <div className="mb-4 flex items-center justify-between border-b border-[#E5E5E0] pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#0D0D0D]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0D0D0D]">
                    تصفية وترتيب
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-[11px] text-[#8B2E2E] underline font-semibold px-1"
                    >
                      إعادة ضبط
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="md:hidden grid h-10 w-10 place-items-center text-[#6B6B66] hover:text-[#0D0D0D]"
                    aria-label="إغلاق التصفية"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Sort Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0D0D0D] flex items-center gap-1.5">
                  <ArrowDownUp className="h-3.5 w-3.5 text-[#0D0D0D]" />
                  <span>الترتيب:</span>
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="w-full min-h-[46px] border border-[#E5E5E0] bg-[#F7F7F5] p-2.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="recommended">الأكثر طلباً ومقترح</option>
                  <option value="newest">وصل حديثاً (الأحدث)</option>
                  <option value="price_asc">السعر: من الأقل للأعلى</option>
                  <option value="price_desc">السعر: من الأعلى للأقل</option>
                </select>
              </div>

              {/* Size Filter - 44px Touch Targets */}
              {availableSizes.length > 0 && (
                <div className="space-y-2 border-t border-[#E5E5E0] pt-4 mt-4">
                  <label className="text-xs font-bold text-[#0D0D0D]">المقاس:</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                        className={`min-w-[3.5rem] h-11 border font-mono text-xs font-bold transition-all ${
                          s === selectedSize
                            ? "border-[#0D0D0D] bg-[#0D0D0D] text-[#F7F7F5]"
                            : "border-[#E5E5E0] bg-[#F7F7F5] text-[#0D0D0D]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Filter */}
              {availableColors.length > 0 && (
                <div className="space-y-2 border-t border-[#E5E5E0] pt-4 mt-4">
                  <label className="text-xs font-bold text-[#0D0D0D]">اللون:</label>
                  <div className="flex flex-wrap gap-2.5">
                    {availableColors.map((c) => (
                      <button
                        key={c}
                        title={c}
                        onClick={() => setSelectedColor(c === selectedColor ? null : c)}
                        className={`h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all ${
                          c === selectedColor
                            ? "border-[#0D0D0D] ring-2 ring-black/30 scale-105"
                            : "border-[#E5E5E0]"
                        }`}
                        style={{ backgroundColor: colorToHex(c) }}
                      >
                        {c === selectedColor && (
                          <Check className="h-4 w-4 text-white mix-blend-difference" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Max Price Slider */}
              <div className="space-y-2 border-t border-[#E5E5E0] pt-4 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0D0D0D]">السعر الأقصى:</span>
                  <span className="price-display font-mono font-bold text-[#0D0D0D]">
                    {formatPrice(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-8 accent-[#0D0D0D]"
                />
              </div>

              {/* Apply Button on Mobile */}
              <div className="mt-6 pt-3 border-t border-[#E5E5E0] md:hidden">
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex min-h-[48px] w-full items-center justify-center bg-[#0D0D0D] py-3 text-xs font-bold text-[#F7F7F5] active:scale-98"
                >
                  عرض النتائج ({filteredProducts.length})
                </button>
              </div>
            </div>
          </>
        )}

        {/* Products Grid - 2 columns on mobile */}
        <div className="flex-1">
          {productsQ.isLoading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse border border-[#E5E5E0] bg-white"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (productsQ.data ?? []).length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center border border-dashed border-[#E5E5E0] p-6 text-center bg-white">
              <h3 className="text-sm font-bold text-[#0D0D0D]">لا توجد منتجات متوفرة حالياً</h3>
              <p className="mt-1 text-xs text-[#6B6B66] max-w-xs">
                نعمل على تجهيز كوليكشن جديد يليق بكم. ترقبوا الإطلاق قريباً.
              </p>
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center border border-dashed border-[#E5E5E0] p-6 text-center bg-white">
              <h3 className="text-sm font-bold text-[#0D0D0D]">لا توجد قطع تطابق الفلاتر</h3>
              <p className="mt-1 text-xs text-[#6B6B66] max-w-xs">
                جرب تغيير المقاس أو اللون أو زيادة نطاق السعر.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 min-h-[44px] bg-[#0D0D0D] px-5 py-2.5 text-xs font-bold text-[#F7F7F5]"
              >
                مسح جميع الفلاتر
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return `min-h-[38px] flex items-center border px-3.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
    active
      ? "border-[#0D0D0D] bg-[#0D0D0D] text-[#F7F7F5]"
      : "border-[#E5E5E0] bg-white text-[#0D0D0D]"
  }`;
}
