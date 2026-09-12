import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useState, useMemo } from "react";
import { Filter, X, ArrowDownUp, RotateCcw } from "lucide-react";
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

  // Extract available sizes and colors from products
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            PR1ME STORE
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {current ? current.name : "الكتالوج وجميع المنتجات"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            عرض {filteredProducts.length} قطعة متوفرة للشحن الفوري
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>إعادة ضبط</span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border px-4 py-2 text-xs font-semibold transition-colors ${
              showFilters
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>تصفية وترتيب</span>
            {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
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
      <div className="mt-6 flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar / Drawer */}
        {showFilters && (
          <>
            {/* Mobile Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden"
              onClick={() => setShowFilters(false)}
            />

            <div className="fixed bottom-0 inset-x-0 z-50 max-h-[85vh] overflow-y-auto border-t border-border bg-background p-5 md:static md:w-60 md:flex-shrink-0 md:border md:border-border md:bg-card md:p-4">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  تصفية المنتجات
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground underline"
                  >
                    مسح
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="md:hidden grid h-7 w-7 place-items-center border border-border"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Sort Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ArrowDownUp className="h-3 w-3 text-emerald-400" />
                  <span>الترتيب:</span>
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="w-full border border-border bg-card p-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="recommended">الأكثر طلباً ومقترح</option>
                  <option value="newest">وصل حديثاً (الأحدث)</option>
                  <option value="price_asc">السعر: من الأقل للأعلى</option>
                  <option value="price_desc">السعر: من الأعلى للأقل</option>
                </select>
              </div>

              {/* Size Filter */}
              {availableSizes.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4 mt-4">
                  <label className="text-xs font-bold text-foreground">المقاس:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                        className={`min-w-[2.25rem] h-8 border font-mono text-xs font-bold transition-all ${
                          s === selectedSize
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card text-foreground hover:border-zinc-500"
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
                <div className="space-y-2 border-t border-border pt-4 mt-4">
                  <label className="text-xs font-bold text-foreground">اللون:</label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((c) => (
                      <button
                        key={c}
                        title={c}
                        onClick={() => setSelectedColor(c === selectedColor ? null : c)}
                        className={`h-6 w-6 rounded-full border transition-all ${
                          c === selectedColor
                            ? "border-foreground ring-2 ring-foreground/40"
                            : "border-border hover:border-zinc-400"
                        }`}
                        style={{ backgroundColor: colorToHex(c) }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Max Price Slider */}
              <div className="space-y-2 border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">السعر الأقصى:</span>
                  <span className="price-display font-mono font-bold text-foreground">
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
                  className="w-full accent-foreground"
                />
              </div>
            </div>
          </>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {productsQ.isLoading ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse border border-border bg-muted/40"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center border border-dashed border-border p-8 text-center">
              <h3 className="text-base font-bold text-foreground">لا توجد منتجات تطابق الفلاتر</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                جرب تغيير المقاس أو اللون أو زيادة نطاق السعر للاطلاع على المنتجات المتاحة.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 border border-border bg-foreground px-4 py-2 text-xs font-bold text-background"
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
  return `border px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
    active
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-zinc-500"
  }`;
}
