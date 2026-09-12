import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useState, useMemo } from "react";
import { Filter, X, ArrowDownUp, RotateCcw, Search, Sparkles } from "lucide-react";
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
          "تصفح أحدث كولكشن من التيشيرتات، الهوديز، البناطيل والملابس الكاجوال من PR1ME. خامات قطنية ممتازة وشحن لجميع محافظات مصر.",
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
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {current ? current.name : "جميع المنتجات والكتالوج"}
            </h1>
            {current && (
              <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-bold">
                قسم خاص
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {filteredProducts.length} قطعة متوفرة وجاهزة للشحن الفوري
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>إعادة تعيين</span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
              showFilters
                ? "border-foreground bg-foreground text-background shadow-md"
                : "border-border/80 bg-card hover:bg-muted text-foreground"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>الفلاتر والترتيب</span>
            {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-whatsapp" />}
          </button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto pb-2">
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
      <div className="mt-8 flex flex-col md:flex-row gap-8">
        {/* Advanced Filters Drawer / Sidebar */}
        {showFilters && (
          <>
            {/* Mobile Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden"
              onClick={() => setShowFilters(false)}
            />

            <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border/70 bg-background p-6 shadow-2xl md:static md:w-64 md:flex-shrink-0 md:rounded-2xl md:border md:border-border/60 md:bg-card md:p-5 md:shadow-none animate-in slide-in-from-bottom-5 md:animate-none">
              <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-3 md:mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-whatsapp" />
                  <h3 className="font-black text-sm text-foreground">تصفية وترتيب المنتجات</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground underline"
                  >
                    مسح
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="md:hidden grid h-8 w-8 place-items-center rounded-xl border border-border/60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ArrowDownUp className="h-3.5 w-3.5 text-whatsapp" />
                  <span>ترتيب حسب:</span>
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="w-full rounded-xl border border-border/80 bg-muted/40 p-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-whatsapp"
                >
                  <option value="recommended">المقترح والأكثر طلباً</option>
                  <option value="newest">وصل حديثاً (الأحدث)</option>
                  <option value="price_asc">السعر: من الأقل للأعلى</option>
                  <option value="price_desc">السعر: من الأعلى للأقل</option>
                </select>
              </div>

              {/* Size Filter */}
              {availableSizes.length > 0 && (
                <div className="space-y-2.5 border-t border-border/50 pt-4 mt-4">
                  <label className="text-xs font-bold text-foreground">المقاس:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                        className={`min-w-[2.5rem] rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
                          s === selectedSize
                            ? "border-foreground bg-foreground text-background shadow-xs"
                            : "border-border/80 bg-muted/40 text-foreground hover:border-foreground/50"
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
                <div className="space-y-2.5 border-t border-border/50 pt-4 mt-4">
                  <label className="text-xs font-bold text-foreground">اللون:</label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((c) => (
                      <button
                        key={c}
                        title={c}
                        onClick={() => setSelectedColor(c === selectedColor ? null : c)}
                        className={`h-7 w-7 rounded-full border-2 transition-all ${
                          c === selectedColor
                            ? "border-foreground ring-2 ring-foreground/30 scale-110"
                            : "border-border/80 hover:scale-105"
                        }`}
                        style={{ backgroundColor: colorToHex(c) }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Max Price Slider */}
              <div className="space-y-2.5 border-t border-border/50 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">السعر الأقصى:</label>
                  <span className="text-xs font-black text-whatsapp">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-whatsapp"
                />
              </div>
            </div>
          </>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {productsQ.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl border border-border/50 bg-muted/40"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
                <Filter className="h-8 w-8 opacity-40" />
              </div>
              <h3 className="text-lg font-bold text-foreground">لا توجد منتجات تطابق اختياراتك</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                جرب تغيير المقاس أو اللون أو زيادة نطاق السعر للوصول إلى المنتجات المتاحة.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-foreground px-5 py-2.5 text-xs font-bold text-background transition-transform hover:scale-105 active:scale-95"
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
  return `rounded-xl border px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
    active
      ? "border-foreground bg-foreground text-background shadow-sm"
      : "border-border/80 bg-card hover:bg-muted text-foreground"
  }`;
}

