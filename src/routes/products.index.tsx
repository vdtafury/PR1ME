import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useState, useMemo } from "react";
import { Filter, X, ArrowDownUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { colorToHex } from "@/lib/colors";
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
      { title: "Shop all products — PR1ME" },
      { name: "description", content: "Browse the full PR1ME catalog: tees, hoodies, jeans, dresses and more." },
      { property: "og:title", content: "Shop all products — PR1ME" },
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
  const [sortOption, setSortOption] = useState<"newest" | "price_asc" | "price_desc" | "recommended">("recommended");

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
    productsQ.data.forEach(p => p.sizes?.forEach(s => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [productsQ.data]);

  const availableColors = useMemo(() => {
    if (!productsQ.data) return [];
    const colors = new Set<string>();
    productsQ.data.forEach(p => p.colors?.forEach(c => colors.add(c)));
    return Array.from(colors).sort();
  }, [productsQ.data]);

  // Client-side filtering and sorting
  const filteredProducts = useMemo(() => {
    if (!productsQ.data) return [];
    let result = [...productsQ.data];

    if (selectedSize) {
      result = result.filter(p => p.sizes?.includes(selectedSize));
    }
    if (selectedColor) {
      result = result.filter(p => p.colors?.includes(selectedColor));
    }
    result = result.filter(p => p.price <= maxPrice);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {current ? current.name : "All products"}
          </h1>
          <p className="text-sm text-muted-foreground">{filteredProducts.length} items</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${showFilters ? "bg-foreground text-background border-foreground" : "bg-background text-foreground hover:bg-muted"}`}
          >
            <Filter className="h-4 w-4" /> Filters & Sort
          </button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => navigate({ search: { q } })}
          className={chip(!category)}
        >All</button>
        {(categories.data ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => navigate({ search: { category: c.slug, q } })}
            className={chip(category === c.slug)}
          >{c.name}</button>
        ))}
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-8">
        {/* Advanced Filters Panel */}
        {showFilters && (
          <>
            {/* Mobile Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setShowFilters(false)}
            />
            
            <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-6 shadow-2xl md:static md:w-64 md:flex-shrink-0 md:rounded-xl md:border md:bg-card md:p-5 md:shadow-none">
              <div className="mb-6 flex items-center justify-between md:mb-4">
                <h3 className="font-bold text-lg md:text-base">Filters & Sort</h3>
                <div className="flex items-center gap-3">
                  <button onClick={resetFilters} className="text-sm font-semibold text-muted-foreground underline">Reset</button>
                  <button onClick={() => setShowFilters(false)} className="md:hidden grid h-8 w-8 place-items-center rounded-md bg-muted hover:bg-muted/80">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2"><ArrowDownUp className="h-4 w-4"/> Sort by</label>
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full rounded-md border border-border bg-transparent p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="recommended">Recommended</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {availableSizes.length > 0 && (
              <div className="space-y-3 border-t border-border pt-4">
                <label className="text-sm font-semibold">Size</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                      className={`min-w-[2.5rem] rounded border px-2 py-1 text-xs font-semibold transition-all ${s === selectedSize ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground/40"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableColors.length > 0 && (
              <div className="space-y-3 border-t border-border pt-4">
                <label className="text-sm font-semibold">Color</label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(c => (
                    <button
                      key={c}
                      title={c}
                      onClick={() => setSelectedColor(c === selectedColor ? null : c)}
                      className={`h-6 w-6 rounded-full border-2 transition-all ${c === selectedColor ? "border-primary ring-2 ring-primary/40" : "border-transparent hover:border-border"}`}
                      style={{ backgroundColor: colorToHex(c) }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Max Price</label>
                <span className="text-xs font-bold text-price">{maxPrice} EGP</span>
              </div>
              <input 
                type="range" 
                min="100" max="5000" step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </>
        )}

        {/* Grid */}
        <div className="flex-1">
          {productsQ.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : filteredProducts.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <Filter className="h-10 w-10 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-bold">No products match your filters</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your size, color, or price range.</p>
              <button onClick={resetFilters} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
    active ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-muted"
  }`;
}
