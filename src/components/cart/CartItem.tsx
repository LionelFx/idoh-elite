"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, getDiscountedPrice, getColorImage, getVariantStock } from "@/lib/utils";
import { getColorName } from "@/lib/colors";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const discount = item.product.discount_percent ?? 0;
  const originalTotal = item.product.price * item.quantity;
  const discountedTotal = getDiscountedPrice(item.product.price, discount) * item.quantity;

  const maxQty = getVariantStock(item.product, item.size, item.color);

  const handleIncrease = () => {
    if (item.quantity < maxQty) {
      updateQuantity(item.id, item.quantity + 1);
      setShowMaxWarning(false);
    } else {
      setShowMaxWarning(true);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      warningTimer.current = setTimeout(() => setShowMaxWarning(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#e0e0e0] overflow-hidden">
      <div className="flex gap-4 p-4">
        <Link href={`/products/${item.product_id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-[#f5f5f5] flex-shrink-0">
          <Image
            src={getColorImage(item.product, item.color)}
            alt={item.product.name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link href={`/products/${item.product_id}`} className="font-semibold text-[#1a1a1a] text-sm leading-tight line-clamp-2 hover:text-[#FF9D3D] transition-colors">
              {item.product.name}
            </Link>
            {discount > 0 && (
              <span className="flex-shrink-0 text-[10px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded">
                -{discount}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <span
              className="w-3.5 h-3.5 rounded-full border border-[#e0e0e0] flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-[#999999]">{getColorName(item.color)} · Taille: {item.size}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className={`flex items-center border rounded overflow-hidden transition-colors duration-200 ${showMaxWarning ? "border-[#FF9D3D]" : "border-[#e0e0e0]"}`}>
              <button
                onClick={() => { updateQuantity(item.id, item.quantity - 1); setShowMaxWarning(false); }}
                disabled={item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#f5f5f5] transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold border-x border-[#e0e0e0]">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className={`font-bold text-sm ${discount > 0 ? "text-red-500" : "text-[#1a1a1a]"}`}>
                  {formatPrice(discountedTotal)}
                </span>
                {discount > 0 && (
                  <p className="text-[11px] text-[#bbb] line-through leading-none mt-0.5">
                    {formatPrice(originalTotal)}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-[#999999] hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message stock max atteint */}
      <div className={`transition-all duration-300 overflow-hidden ${showMaxWarning ? "max-h-16" : "max-h-0"}`}>
        <div className="flex items-center gap-2.5 bg-[#FF9D3D]/10 border-t border-[#FF9D3D]/20 px-4 py-2.5">
          <span className="text-base">⚡</span>
          <div>
            <p className="text-xs font-bold text-[#FF9D3D]">
              Stock limité — {maxQty} exemplaire{maxQty > 1 ? "s" : ""} dispo en taille {item.size}
            </p>
            <p className="text-[10px] text-[#FF9D3D]/70">Tu as atteint le maximum disponible pour cette taille.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
