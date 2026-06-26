"use client";

import { useCart } from "@/contexts/CartContext";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CartEmpty from "@/components/cart/CartEmpty";

export default function CartPage() {
  const { items, mounted } = useCart();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center pt-20">
        <div className="text-[#999999] text-xs font-bold uppercase tracking-widest animate-pulse">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Dark header */}
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10 lg:pb-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">Votre sélection</span>
          <h1
            className="font-condensed font-black uppercase text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Mon Panier
          </h1>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {items.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <p className="text-sm text-[#999999] mb-4">{items.length} article{items.length > 1 ? "s" : ""}</p>
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            <div>
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

