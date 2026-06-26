"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getDiscountedPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/contexts/ToastContext";
import RatingStars from "./RatingStars";

interface ProductCardProps {
  product: Product;
  hideCategory?: boolean;
}

function getProductBadge(product: Product): { label: string; style: string } | null {
  if (product.discount_percent > 0) {
    return { label: `-${product.discount_percent}%`, style: "bg-red-500 text-white" };
  }
  if (product.stock > 0 && product.stock <= 5) {
    return { label: `⚡ ${product.stock} restants`, style: "bg-[#FF9D3D] text-white" };
  }
  if (product.reviews_count >= 35) {
    return { label: "★ Bestseller", style: "bg-[#1a1a1a] text-white" };
  }
  return null;
}

export default function ProductCard({ product, hideCategory = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { addToast } = useToast();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const isWished = has(product.id);
  const badge = getProductBadge(product);
  const displayImage = hovered && product.images[1] ? product.images[1] : product.images[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors[0], product.sizes[0]);
    setAdded(true);
    addToast(`${product.name} ajouté au panier !`);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    addToast(
      isWished ? `Retiré des favoris` : `Ajouté aux favoris ♥`,
      "info"
    );
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-lg overflow-hidden border border-[#e0e0e0] hover:border-[#FF9D3D] hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#f5f5f5] aspect-square">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Category badge */}
        {!hideCategory && (
          <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
            {product.category}
          </span>
        )}

        {/* Promo / Stock / Bestseller badge */}
        {badge && (
          <span className={`absolute top-3 ${product.discount_percent > 0 ? "right-3 text-sm font-black px-2.5 py-1" : "right-10 text-[10px] font-bold px-2 py-1"} uppercase tracking-widest rounded shadow-sm ${badge.style}`}>
            {badge.label}
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isWished
              ? "bg-[#FF9D3D] text-white scale-110"
              : "bg-white/80 text-[#999999] hover:bg-white hover:text-[#FF9D3D] opacity-0 group-hover:opacity-100"
          }`}
          aria-label="Ajouter aux favoris"
        >
          <Heart className={`w-3.5 h-3.5 ${isWished ? "fill-current" : ""}`} />
        </button>

        {/* Quick add */}
        <button
          onClick={handleQuickAdd}
          className={`absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            added
              ? "bg-green-500 text-white translate-y-0 opacity-100"
              : "bg-[#FF9D3D] text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:bg-[#FFB366]"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {added ? "Ajouté !" : "Ajouter"}
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-[#1a1a1a] text-sm leading-tight mb-1 line-clamp-1 group-hover:text-[#FF9D3D] transition-colors duration-200">
          {product.name}
        </h3>

        <RatingStars rating={product.rating} reviewsCount={product.reviews_count} className="mb-2" />

        <div className="flex items-center justify-between">
          {product.discount_percent > 0 ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-500">{formatPrice(getDiscountedPrice(product.price, product.discount_percent))}</span>
              <span className="text-xs text-[#999] line-through">{formatPrice(product.price)}</span>
            </div>
          ) : (
            <span className="font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
          )}
          <div className="flex items-center gap-1">
            {product.colors.slice(0, 3).map((color) => (
              <span
                key={color}
                className="w-3.5 h-3.5 rounded-full border border-[#e0e0e0]"
                style={{ backgroundColor: color }}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[10px] text-[#999999]">+{product.colors.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
