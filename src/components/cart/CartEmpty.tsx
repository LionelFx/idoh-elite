import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function CartEmpty() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 rounded-full bg-white border-2 border-[#e0e0e0] flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-8 h-8 text-[#999999]" />
      </div>
      <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-2xl mb-3">Ton panier est vide</h2>
      <p className="text-[#999999] mb-2 text-sm">T&apos;as encore rien ajouté.</p>
      <p className="text-[#999999] mb-8 text-sm">Les meilleures pièces t&apos;attendent dans le catalogue.</p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-[#FF9D3D] text-white px-8 py-4 rounded font-bold uppercase tracking-wider text-sm hover:bg-[#FFB366] transition-colors"
      >
        Voir le catalogue
      </Link>
    </div>
  );
}
