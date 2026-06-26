"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";
import categoriesData from "@/data/categories.json";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { Product, Category, SortOption } from "@/types";
import { fetchProducts } from "@/lib/products";

const categories = categoriesData as Category[];

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function compareSizes(a: string, b: string) {
  const an = Number(a);
  const bn = Number(b);
  const aIsNum = !Number.isNaN(an);
  const bIsNum = !Number.isNaN(bn);
  if (aIsNum && bIsNum) return an - bn;
  if (aIsNum !== bIsNum) return aIsNum ? -1 : 1;
  const ai = SIZE_ORDER.indexOf(a.toUpperCase());
  const bi = SIZE_ORDER.indexOf(b.toUpperCase());
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== bi) return ai === -1 ? 1 : -1;
  return a.localeCompare(b);
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Nouveautés",
  popular: "Popularité",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1500);

  useEffect(() => { fetchProducts().then(p => { setProducts(p); setLoading(false); }); }, []);

  const selectedCat = searchParams.get("cat") ?? "";
  const sort = (searchParams.get("sort") as SortOption) ?? "newest";
  const query = searchParams.get("q") ?? "";
  const selectedSizes = useMemo(() => (searchParams.get("size") ?? "").split(",").filter(Boolean), [searchParams]);
  const selectedColors = useMemo(() => (searchParams.get("color") ?? "").split(",").filter(Boolean), [searchParams]);

  const currentCategory = categories.find((c) => c.slug === selectedCat);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set).sort(compareSizes);
  }, [products]);

  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.colors.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }
    if (selectedCat) {
      list = list.filter(
        (p) =>
          p.category.toLowerCase() === selectedCat.toLowerCase() ||
          categories.find((c) => c.id === p.category_id)?.slug === selectedCat
      );
    }
    if (selectedSizes.length) list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (selectedColors.length) list = list.filter((p) => p.colors.some((c) => selectedColors.includes(c)));
    list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice);
    if (sort === "newest") list.sort((a, b) => {
      if (a.category_id !== b.category_id) return parseInt(a.category_id) - parseInt(b.category_id);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    if (sort === "popular") list.sort((a, b) => b.reviews_count - a.reviews_count);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [selectedCat, sort, minPrice, maxPrice, query, products, selectedSizes, selectedColors]);

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (val) p.set(key, val);
    else p.delete(key);
    router.push(`?${p.toString()}`, { scroll: false });
  };

  const toggleListParam = (key: string, value: string) => {
    const current = (searchParams.get(key) ?? "").split(",").filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParam(key, next.join(","));
  };

  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(1500);
    router.push("/products", { scroll: false });
  };

  const headerTitle = query
    ? `Résultats pour "${query}"`
    : currentCategory
    ? currentCategory.name
    : "Catalogue iDoh ELITE";

  return (
    <div>
      {/* Dark header */}
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10 lg:pb-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">
            {query ? "Recherche" : "Collection"}
          </span>
          <h1
            className="font-condensed font-black uppercase text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            {headerTitle}
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            {loading ? "Chargement…" : `${filtered.length} produit${filtered.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-[#1a1a1a] rounded text-sm font-semibold cursor-pointer hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </button>

          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-[#e0e0e0] rounded text-sm font-semibold cursor-pointer"
            >
              {SORT_LABELS[sort]}
              <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#e0e0e0] rounded shadow-xl z-10">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setParam("sort", s); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#f5f5f5] cursor-pointer ${sort === s ? "font-bold text-[#FF9D3D]" : "text-[#1a1a1a]"}`}
                  >
                    {SORT_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`flex-shrink-0 w-64 ${filtersOpen ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-24 space-y-8">
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="font-bold text-[#1a1a1a] uppercase tracking-wider text-sm">Filtres</h3>
                <button onClick={() => setFiltersOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              {/* Sort desktop */}
              <div className="hidden lg:block">
                <h4 className="font-bold text-xs uppercase tracking-widest text-[#FF9D3D] mb-4">Trier par</h4>
                <div className="space-y-1">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setParam("sort", s)}
                      className={`w-full text-left py-2 px-3 rounded text-sm transition-colors cursor-pointer ${
                        sort === s ? "bg-[#FF9D3D] text-white font-bold" : "text-[#333333] hover:bg-[#f5f5f5]"
                      }`}
                    >
                      {SORT_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-[#FF9D3D] mb-4">Catégorie</h4>
                <div className="space-y-1">
                  <button
                    onClick={resetFilters}
                    className={`w-full text-left py-2 px-3 rounded text-sm transition-colors cursor-pointer ${
                      !selectedCat ? "bg-[#1a1a1a] text-white font-bold" : "text-[#333333] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    Tout voir ({products.length})
                  </button>
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category_id === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setParam("cat", cat.slug)}
                        className={`w-full text-left py-2 px-3 rounded text-sm transition-colors cursor-pointer flex items-center justify-between ${
                          selectedCat === cat.slug ? "bg-[#1a1a1a] text-white font-bold" : "text-[#333333] hover:bg-[#f5f5f5]"
                        }`}
                      >
                        <span>{cat.icon} {cat.name}</span>
                        <span className={`text-xs ${selectedCat === cat.slug ? "text-white/60" : "text-[#999999]"}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Taille */}
              {allSizes.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#FF9D3D] mb-4">Taille</h4>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleListParam("size", size)}
                        className={`min-w-[2.75rem] h-9 px-2 rounded text-xs font-bold uppercase transition-colors cursor-pointer border ${
                          selectedSizes.includes(size)
                            ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                            : "border-[#e0e0e0] text-[#333333] hover:border-[#1a1a1a]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Couleur */}
              {allColors.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#FF9D3D] mb-4">Couleur</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {allColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => toggleListParam("color", color)}
                        title={color}
                        className="w-8 h-8 rounded-full flex-shrink-0 transition-transform cursor-pointer hover:scale-110"
                        style={{
                          backgroundColor: color,
                          boxShadow: selectedColors.includes(color)
                            ? "0 0 0 2px #ffffff, 0 0 0 4px #FF9D3D"
                            : "inset 0 0 0 1px rgba(0,0,0,0.15)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-[#FF9D3D] mb-4">Prix</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#999999] mb-1.5">
                      <span>Min</span>
                      <span className="font-semibold text-[#1a1a1a]">{minPrice} €</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1500}
                      step={50}
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                      className="w-full accent-[#FF9D3D]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#999999] mb-1.5">
                      <span>Max</span>
                      <span className="font-semibold text-[#1a1a1a]">{maxPrice} €</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1500}
                      step={50}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                      className="w-full accent-[#FF9D3D]"
                    />
                  </div>
                </div>
              </div>

              {/* Reset */}
              {(selectedCat || sort !== "newest" || minPrice > 0 || maxPrice < 1500 || query || selectedSizes.length > 0 || selectedColors.length > 0) && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 text-sm text-[#999999] hover:text-[#FF9D3D] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" /> Réinitialiser
                </button>
              )}
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                {query ? (
                  <>
                    <Search className="w-10 h-10 text-[#e0e0e0] mx-auto mb-4" />
                    <p className="text-[#999999] text-lg mb-2">Aucun résultat pour &ldquo;{query}&rdquo;</p>
                    <p className="text-[#999999] text-sm mb-6">Essayez un autre terme ou parcourez le catalogue.</p>
                  </>
                ) : (
                  <p className="text-[#999999] text-lg mb-4">Aucun produit trouvé</p>
                )}
                <button
                  onClick={resetFilters}
                  className="text-[#FF9D3D] font-semibold hover:underline cursor-pointer"
                >
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div>
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10 lg:pb-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="h-3 w-20 bg-white/20 rounded animate-pulse mb-3" />
          <div className="h-10 w-72 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-6 bg-[#f0f0f0] rounded animate-pulse" />)}
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogContent />
      </Suspense>
    </div>
  );
}

