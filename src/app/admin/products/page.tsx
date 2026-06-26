"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, AlertTriangle, Search, X, Star } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  brand: string;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const [search, setSearch] = useState("");

  const load = () =>
    getSupabase().from("products").select("id, name, price, category, stock, images, brand, rating, reviews_count, is_featured")
      .order("category").then(({ data, error }) => {
        setProducts(data ?? []);
        setLoadError(error ? error.message : "");
        setLoading(false);
      });

  useEffect(() => { load(); }, []);

  // Catégories dynamiques issues des produits chargés
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category))).sort();
    return ["Tous", ...cats];
  }, [products]);

  // Produits filtrés par catégorie + recherche
  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== "Tous") list = list.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return;
    setDeleting(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    const { error } = await getSupabase().from("products").delete().eq("id", id);
    if (error) await load();
    setDeleting(null);
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, is_featured: !current } : p)));
    const { error } = await getSupabase().from("products").update({ is_featured: !current }).eq("id", id);
    if (error) await load();
  };

  return (
    <div>
      {loadError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
          Erreur de chargement : {loadError}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-condensed font-black uppercase text-white text-3xl">Produits</h1>
          <p className="text-white/40 text-sm mt-1">
            {filtered.length} / {products.length} produit{products.length > 1 ? "s" : ""}
            {activeCategory !== "Tous" && <span className="text-[#FF9D3D] ml-1">· {activeCategory}</span>}
          </p>
        </div>
        <Link href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-xs px-5 py-3 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </Link>
      </div>

      {/* Filtres + Recherche */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Barre de recherche */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            className="w-full bg-[#141414] border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-white text-sm outline-none focus:border-[#FF9D3D] placeholder-white/20 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-[#FF9D3D] text-white shadow-[0_0_12px_rgba(255,157,61,0.3)]"
                  : "bg-[#1e1e1e] border border-white/10 text-white/50 hover:text-white hover:border-white/30"
              }`}
            >
              {cat}
              {cat !== "Tous" && (
                <span className={`ml-1.5 text-[10px] font-normal ${activeCategory === cat ? "opacity-70" : "opacity-40"}`}>
                  {products.filter(p => p.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <p className="font-semibold">Aucun produit trouvé</p>
          {(search || activeCategory !== "Tous") && (
            <button onClick={() => { setSearch(""); setActiveCategory("Tous"); }}
              className="mt-3 text-xs text-[#FF9D3D] hover:underline cursor-pointer">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Produit", "Catégorie", "Prix", "Stock", "Note", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1e1e1e] flex-shrink-0">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">?</div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{product.name}</p>
                          <p className="text-white/40 text-xs">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setActiveCategory(product.category)}
                        className="text-[#FF9D3D] text-xs font-bold uppercase tracking-wider bg-[#FF9D3D]/10 hover:bg-[#FF9D3D]/20 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                      >
                        {product.category}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-white font-bold text-sm">{formatPrice(product.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-bold flex items-center gap-1 ${
                        product.stock === 0 ? "text-red-400" : product.stock <= 5 ? "text-yellow-400" : "text-green-400"
                      }`}>
                        {product.stock <= 5 && product.stock > 0 && <AlertTriangle className="w-3 h-3" />}
                        {product.stock === 0 ? "Rupture" : product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/60 text-sm">
                      ★ {product.rating} <span className="text-white/30">({product.reviews_count})</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleFeatured(product.id, product.is_featured)}
                          title={product.is_featured ? "Retirer de la page d'accueil" : "Mettre en avant sur la page d'accueil"}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            product.is_featured ? "bg-[#FF9D3D]/20 text-[#FF9D3D]" : "bg-white/5 hover:bg-[#FF9D3D]/20 hover:text-[#FF9D3D] text-white/40"
                          }`}>
                          <Star className={`w-3.5 h-3.5 ${product.is_featured ? "fill-[#FF9D3D]" : ""}`} />
                        </button>
                        <Link href={`/admin/products/${product.id}`}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#FF9D3D]/20 hover:text-[#FF9D3D] text-white/40 flex items-center justify-center transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
