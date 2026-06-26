"use client";

import Link from "next/link";
import { Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";

const FREE_THRESHOLD = 70;

export default function CartSummary() {
  const { total } = useCart();
  const isFree = total >= FREE_THRESHOLD;
  const remaining = Math.max(0, FREE_THRESHOLD - total);
  const progress = Math.min((total / FREE_THRESHOLD) * 100, 100);

  return (
    <div className="bg-[#f5f5f5] rounded-xl p-6">
      <h3 className="font-condensed font-black uppercase tracking-wider text-[#1a1a1a] text-xl mb-5">
        Résumé de la commande
      </h3>

      {/* Free shipping progress */}
      <div className="mb-5 bg-white rounded-lg p-4 border border-[#e0e0e0]">
        <div className="flex items-center gap-2 mb-2">
          <Truck className={`w-4 h-4 flex-shrink-0 ${isFree ? "text-green-500" : "text-[#FF9D3D]"}`} />
          {isFree ? (
            <span className="text-xs font-bold text-green-600">✓ Livraison gratuite débloquée !</span>
          ) : (
            <span className="text-xs text-[#999999]">
              <strong className="text-[#1a1a1a]">{formatPrice(remaining)}</strong> de plus pour la livraison gratuite
            </span>
          )}
        </div>
        <div className="h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: isFree ? "#22c55e" : "#FF9D3D" }}
          />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-[#999999]">Sous-total</span>
          <span className="font-semibold text-[#1a1a1a]">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#999999]">Livraison</span>
          <span className={`font-semibold ${isFree ? "text-green-600" : "text-[#1a1a1a]"}`}>
            {isFree ? "Gratuite" : "Calculée à l'étape suivante"}
          </span>
        </div>
        <div className="border-t border-[#e0e0e0] pt-3 flex justify-between">
          <span className="font-bold text-[#1a1a1a]">Total TTC</span>
          <span className="font-bold text-[#FF9D3D] text-lg">{formatPrice(total)}</span>
        </div>
      </div>

      <p className="text-center text-xs text-[#999999] mb-3">
        ⚡ Ces articles sont très demandés. Commande vite.
      </p>

      <Link
        href="/checkout"
        className="flex items-center justify-center gap-2 w-full bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-wider text-sm px-6 py-4 rounded transition-colors duration-200 active:scale-[0.98]"
      >
        Commander maintenant →
      </Link>

      <Link
        href="/products"
        className="flex items-center justify-center w-full mt-3 border-2 border-[#1a1a1a] text-[#1a1a1a] font-bold uppercase tracking-wider text-sm px-6 py-3 rounded hover:bg-[#1a1a1a] hover:text-white transition-colors duration-200"
      >
        Continuer mes achats
      </Link>

      <div className="mt-5 pt-5 border-t border-[#e0e0e0] grid grid-cols-3 gap-3 text-center">
        {[
          { icon: "🔒", label: "Paiement sécurisé" },
          { icon: "🚚", label: "Gratuit dès 70€" },
          { icon: "↩️", label: "Retours 30j" },
        ].map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1">
            <span className="text-lg">{b.icon}</span>
            <span className="text-[10px] text-[#999999] font-medium leading-tight">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Carriers */}
      <div className="mt-4 pt-4 border-t border-[#e0e0e0]">
        <p className="text-[10px] text-[#999999] text-center mb-3 uppercase tracking-wider font-bold">
          Livraison via
        </p>
        <div className="flex items-center justify-center gap-4">
          <img src="/carriers/mondial-relay.svg" alt="Mondial Relay" className="h-16 w-16 rounded-xl object-cover" />
          <img src="/carriers/colissimo.svg" alt="Colissimo" className="h-12 w-36 object-contain" />
          <img src="/carriers/laposte.svg" alt="La Poste" className="h-16 w-16 rounded-xl object-cover" />
        </div>
      </div>

      <p className="text-center text-[10px] text-[#999999] mt-4">
        ★★★★★ +500 commandes livrées avec succès
      </p>
    </div>
  );
}
