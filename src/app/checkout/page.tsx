"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import CheckoutForm from "@/components/forms/CheckoutForm";

export default function CheckoutPage() {
  const { items, mounted } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (mounted && items.length === 0) router.push("/cart");
  }, [mounted, items.length, router]);

  if (!mounted) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center pt-20">
      <div className="text-[#999999] text-xs font-bold uppercase tracking-widest animate-pulse">Chargement…</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10 lg:pb-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Steps */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="text-green-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Panier
            </span>
            <span className="w-6 h-px bg-white/20 block" />
            <span className="text-[#FF9D3D]">Livraison &amp; Paiement</span>
          </div>

          <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">
            Commander
          </span>
          <h1 className="font-condensed font-black uppercase text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Finaliser ma commande
          </h1>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <CheckoutForm />
      </div>
    </div>
  );
}
