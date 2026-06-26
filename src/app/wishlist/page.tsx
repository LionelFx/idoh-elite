"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import ProductCard from "@/components/product/ProductCard";
import { fetchProducts } from "@/lib/products";
import { Product } from "@/types";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => { fetchProducts().then(setAllProducts); }, []);

  const wishlistedProducts = allProducts.filter(p => ids.includes(p.id));

  const handleAddAll = () => {
    wishlistedProducts.forEach(p => addItem(p, p.colors[0], p.sizes[0]));
    addToast(`${wishlistedProducts.length} pièce${wishlistedProducts.length > 1 ? "s" : ""} ajoutée${wishlistedProducts.length > 1 ? "s" : ""} au panier !`);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10 lg:pb-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex items-end justify-between">
          <div>
            <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">Mes favoris</span>
            <h1 className="font-condensed font-black uppercase text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              Ma Wishlist
            </h1>
            {wishlistedProducts.length > 0 && (
              <p className="text-white/50 mt-2 text-sm">
                {wishlistedProducts.length} pièce{wishlistedProducts.length > 1 ? "s" : ""} sauvegardée{wishlistedProducts.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
          {wishlistedProducts.length > 1 && (
            <button
              onClick={handleAddAll}
              className="hidden sm:flex items-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-xs px-5 py-3 rounded transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Tout ajouter au panier
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {wishlistedProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-[#e0e0e0] flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-[#999999]" />
            </div>
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-2xl mb-3">
              Ta wishlist est vide
            </h2>
            <p className="text-[#999999] text-sm mb-2 max-w-xs mx-auto">
              T&apos;as pas encore sauvegardé de pièces.
            </p>
            <p className="text-[#999999] text-sm mb-8 max-w-xs mx-auto">
              Clique sur le ♥ dans le catalogue pour garder tes coups de cœur.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded transition-colors"
            >
              Voir le catalogue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {wishlistedProducts.length > 1 && (
              <button
                onClick={handleAddAll}
                className="sm:hidden w-full flex items-center justify-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-sm px-5 py-3.5 rounded transition-colors cursor-pointer mb-6"
              >
                <ShoppingBag className="w-4 h-4" />
                Tout ajouter au panier
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-[#e0e0e0] text-center">
              <p className="text-[#999999] text-sm mb-1">Ces pièces partent vite.</p>
              <p className="text-[#1a1a1a] font-semibold text-sm mb-6">
                Ajoute-les au panier avant qu&apos;elles disparaissent.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white font-bold uppercase tracking-widest text-sm px-8 py-3.5 rounded transition-all duration-200"
              >
                Continuer à explorer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
