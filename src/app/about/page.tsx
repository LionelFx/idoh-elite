import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Shield, Heart, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos | iDoh ELITE",
  description: "L'histoire d'iDoh ELITE — Born from the streets, built for the elite.",
};

const values = [
  { Icon: Zap,    title: "Authenticité",  text: "Chaque pièce est vérifiée. Rien que du vrai, jamais du faux." },
  { Icon: Shield, title: "Qualité",       text: "On sélectionne uniquement ce qu'on porterait nous-mêmes." },
  { Icon: Heart,  title: "Passion",       text: "Le sport et la mode ne font qu'un ici. C'est un mode de vie." },
  { Icon: Star,   title: "Excellence",    text: "Pas de compromis. Si c'est pas elite, c'est pas chez nous." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-20 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 60% 50%, rgba(255,157,61,0.08) 0%, transparent 60%)",
        }} />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#FF9D3D] to-transparent" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-4">Notre histoire</span>
          <h1 className="font-condensed font-black uppercase text-white leading-none mb-6" style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}>
            BORN FROM<br />
            <span className="text-[#FF9D3D]">THE STREETS</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl leading-relaxed">
            iDoh ELITE est né d&apos;une obsession simple : porter les meilleures pièces du game, sans compromis. Sport, luxe, streetwear — trois univers réunis en une seule adresse.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-3">Qui on est</span>
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-4xl lg:text-5xl mb-6 leading-none">
              L&apos;élite ne se contente pas de la moyenne.
            </h2>
            <div className="space-y-4 text-[#555] text-sm leading-relaxed">
              <p>
                Tout a commencé avec une frustration : trouver des pièces vraiment premium — maillots officiels, sneakers de luxe, survêtements signature — sans tomber sur des contrefaçons ou des prix absurdes.
              </p>
              <p>
                iDoh ELITE a été créé pour combler ce manque. On sourcings directement les meilleures pièces, on vérifie chaque article, et on les livre partout en France et dans l&apos;Union Européenne.
              </p>
              <p className="font-semibold text-[#1a1a1a]">
                Parce que ceux qui refusent de s&apos;arrêter méritent ce qu&apos;il y a de mieux.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image src="/products/jordan-kaws-1.webp" alt="Jordan KAWS" fill className="object-cover" />
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden mt-8">
              <Image src="/products/france-away-clean.webp" alt="Maillot" fill className="object-cover" />
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden -mt-8">
              <Image src="/products/burberry-1.webp" alt="Burberry" fill className="object-cover" />
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image src="/products/nb610-1.webp" alt="NB610" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#1a1a1a] py-14">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Commandes livrées" },
              { value: "4.8★", label: "Note moyenne" },
              { value: "10+",  label: "Marques premium" },
              { value: "2",    label: "Zones de livraison" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-condensed font-black text-[#FF9D3D] text-4xl lg:text-5xl mb-1">{value}</div>
                <div className="text-white/50 text-xs uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-3">Ce qu&apos;on défend</span>
          <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-4xl">Nos valeurs</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ Icon, title, text }) => (
            <div key={title} className="bg-[#f5f5f5] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-full bg-[#FF9D3D]/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#FF9D3D]" />
              </div>
              <h3 className="font-bold text-[#1a1a1a] uppercase tracking-wider text-sm mb-2">{title}</h3>
              <p className="text-[#999] text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#FF9D3D] py-14">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-condensed font-black uppercase text-white text-4xl mb-4">
            Prêt à rejoindre l&apos;élite ?
          </h2>
          <p className="text-white/80 text-sm mb-8 max-w-sm mx-auto">
            Explore la collection et trouve les pièces qui te définissent.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#333] text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-lg transition-colors"
          >
            Voir le catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
