import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Orange accent line top */}
        <div className="w-12 h-1 bg-[#FF9D3D] mx-auto mb-8" />

        <p className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest mb-4">Erreur</p>

        <div
          className="font-condensed font-black text-white leading-none mb-4 select-none"
          style={{ fontSize: "clamp(6rem, 20vw, 14rem)" }}
        >
          <span className="text-[#FF9D3D]">4</span>
          <span>0</span>
          <span className="text-[#FF9D3D]">4</span>
        </div>

        <h1
          className="font-condensed font-black uppercase text-white mb-4"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
        >
          Page introuvable
        </h1>

        <p className="text-white/50 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
          Cette page n&apos;existe pas ou a été déplacée. Retournez explorer la collection.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Accueil
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded transition-colors"
          >
            Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
