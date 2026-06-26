"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Heart, Star, Package, RefreshCw, Shield } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PreviewProduct {
  name: string;
  price: string;
  description: string;
  category: string;
  brand: string;
  stock_by_size: Record<string, number>;
  colors: string[];
  images: string[];
  rating: string;
  reviews_count: string;
}

interface Props {
  product: PreviewProduct;
}

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23999'%3EPhoto produit%3C/text%3E%3C/svg%3E";

export default function ProductPreview({ product }: Props) {
  const [view, setView] = useState<"card" | "detail">("card");
  const [mainImg, setMainImg] = useState(0);

  const img = product.images[mainImg] || product.images[0] || PLACEHOLDER;
  const price = parseFloat(product.price) || 0;
  const sizeEntries = Object.entries(product.stock_by_size ?? {});
  const allSizes = sizeEntries.map(([s]) => s);
  const stock = sizeEntries.reduce((s, [, q]) => s + q, 0);
  const rating = parseFloat(product.rating) || 4.5;
  const reviews = parseInt(product.reviews_count) || 0;

  return (
    <div className="sticky top-8">
      {/* Toggle */}
      <div className="flex bg-[#1e1e1e] border border-white/10 rounded-xl p-1 mb-4">
        {(["card", "detail"] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              view === v ? "bg-[#FF9D3D] text-white" : "text-white/30 hover:text-white"
            }`}>
            {v === "card" ? "Carte catalogue" : "Page produit"}
          </button>
        ))}
      </div>

      <div className="text-white/30 text-[10px] uppercase tracking-widest text-center mb-3">Aperçu en temps réel</div>

      {view === "card" ? (
        /* ── CARD VIEW ── */
        <div className="max-w-[260px] mx-auto">
          <div className="group bg-white rounded-lg overflow-hidden border border-[#e0e0e0] shadow-xl">
            <div className="relative aspect-square bg-[#f5f5f5]">
              <Image src={img} alt={product.name || "Produit"} fill className="object-cover" sizes="260px" />
              <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                {product.category || "Catégorie"}
              </span>
              {stock > 0 && stock <= 5 && (
                <span className="absolute top-3 right-8 bg-[#FF9D3D] text-white text-[10px] font-bold px-2 py-1 rounded">
                  ⚡ {stock} restants
                </span>
              )}
              <button className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-[#999]" />
              </button>
              <button className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 rounded bg-[#FF9D3D] text-white text-xs font-bold uppercase">
                <ShoppingBag className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[#1a1a1a] text-sm leading-tight mb-1 line-clamp-1">
                {product.name || "Nom du produit"}
              </h3>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? "fill-[#FF9D3D] text-[#FF9D3D]" : "text-[#e0e0e0]"}`} />
                ))}
                <span className="text-[10px] text-[#999] ml-1">({reviews})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1a1a1a]">{price > 0 ? formatPrice(price) : "— €"}</span>
                <div className="flex gap-1">
                  {product.colors.slice(0, 3).map(c => (
                    <span key={c} className="w-3.5 h-3.5 rounded-full border border-[#e0e0e0]" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── DETAIL VIEW ── */
        <div className="bg-white rounded-xl overflow-hidden border border-[#e0e0e0] shadow-xl">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-[#f5f5f5]">
            <Image src={img} alt={product.name || "Produit"} fill className="object-cover" sizes="400px" />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 px-4 pt-3">
              {product.images.slice(0, 4).map((url, i) => (
                <button key={i} onClick={() => setMainImg(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                    mainImg === i ? "border-[#FF9D3D]" : "border-transparent"
                  }`}>
                  <Image src={url} alt="" width={48} height={48} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="p-4 space-y-3">
            {/* Category + name */}
            <div>
              <span className="text-[#FF9D3D] text-[10px] font-bold uppercase tracking-widest">
                {product.category || "Catégorie"}
              </span>
              <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl leading-tight">
                {product.name || "Nom du produit"}
              </h2>
              {product.brand && <p className="text-[#999] text-xs">{product.brand}</p>}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? "fill-[#FF9D3D] text-[#FF9D3D]" : "text-[#e0e0e0]"}`} />
              ))}
              <span className="text-xs text-[#999] ml-1">{rating} ({reviews} avis)</span>
            </div>

            {/* Price */}
            <p className="font-condensed font-black text-[#FF9D3D] text-3xl">
              {price > 0 ? formatPrice(price) : "— €"}
            </p>

            {/* Stock */}
            <div className="text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-[#999]">Disponibilité</span>
                <span className={stock === 0 ? "text-red-500 font-bold" : stock <= 5 ? "text-[#FF9D3D] font-bold" : "text-green-600 font-semibold"}>
                  {stock === 0 ? "Rupture de stock" : stock <= 5 ? `⚡ Plus que ${stock} !` : `En stock — ${stock} ex.`}
                </span>
              </div>
              <div className="h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: stock === 0 ? "0%" : `${Math.min((stock / 25) * 100, 100)}%`,
                  backgroundColor: stock === 0 ? "#ef4444" : stock <= 5 ? "#FF9D3D" : "#22c55e",
                }} />
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[#333] text-xs leading-relaxed line-clamp-3">{product.description}</p>
            )}

            {/* Sizes */}
            {allSizes.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">Taille</p>
                <div className="flex flex-wrap gap-1.5">
                  {allSizes.map((s, i) => {
                    const qty = product.stock_by_size[s] ?? 0;
                    const outOfStock = qty === 0;
                    return (
                      <span key={s} className={`px-2.5 py-1 border rounded text-xs font-semibold relative ${
                        outOfStock
                          ? "border-[#e0e0e0] text-[#bbb] line-through cursor-not-allowed"
                          : i === 0 ? "border-[#FF9D3D] bg-[#FF9D3D] text-white" : "border-[#e0e0e0] text-[#1a1a1a]"
                      }`}>
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">Couleur</p>
                <div className="flex gap-2">
                  {product.colors.map((c, i) => (
                    <span key={c} className={`w-6 h-6 rounded-full border-2 ${i === 0 ? "border-[#FF9D3D]" : "border-[#e0e0e0]"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded bg-[#FF9D3D] text-white font-bold uppercase tracking-wider text-sm opacity-90">
              <ShoppingBag className="w-4 h-4" /> Ajouter au panier
            </button>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[{ icon: Package, label: "Livraison dès 70€" }, { icon: RefreshCw, label: "Retours 30j" }, { icon: Shield, label: "Sécurisé" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 bg-[#f5f5f5] rounded-lg p-2">
                  <Icon className="w-3.5 h-3.5 text-[#999]" />
                  <span className="text-[9px] text-[#999] text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
