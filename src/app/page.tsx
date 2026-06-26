"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, ShieldCheck, Star, Truck, Lock, Clock } from "lucide-react";
import { fetchProducts, fetchFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";
import BrandMarquee from "@/components/ui/BrandMarquee";
import { Product } from "@/types";
import { useReveal } from "@/hooks/useReveal";

const CATEGORY_IMGS: Record<string, { slug: string; img: string; name: string }> = {
  "1": { slug: "maillot",    img: "/products/france-away-clean.webp", name: "Maillots" },
  "2": { slug: "chaussure",  img: "/products/jordan-kaws-1.webp",     name: "Chaussures" },
  "3": { slug: "survetement",img: "/products/nocta.webp",              name: "Survêtements" },
  "4": { slug: "tshirt",     img: "/products/burberry-1.webp",         name: "T-shirts" },
};

function RevealDiv({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useReveal();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`reveal ${className}`}>
      {children}
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.ok) {
      setDone(true);
    } else {
      setError(json.error ?? "Une erreur est survenue.");
    }
  };

  return (
    <section className="bg-[#FF9D3D] py-14">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-white/70 text-xs font-bold uppercase tracking-widest block mb-2">Accès privilégié</span>
        <h2 className="font-condensed font-black uppercase text-white mb-2" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
          Sois le premier au courant.
        </h2>
        <p className="text-white/80 text-sm mb-8 max-w-sm mx-auto">
          Nouveaux drops, offres privées, pièces en avant-première — direct dans ta boîte mail. Gratuit. Sans spam.
        </p>
        {done ? (
          <p className="text-white font-bold text-lg">✓ C&apos;est bon ! Bienvenue dans l&apos;élite.</p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="ton@email.fr"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className="flex-1 px-5 py-3.5 rounded-lg text-sm text-[#1a1a1a] outline-none placeholder-[#999] bg-white focus:ring-2 focus:ring-white/50"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1a1a1a] hover:bg-[#333] text-white font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
              >
                {loading ? "…" : "Je m’inscris"}
              </button>
            </form>
            {error && <p className="text-white/80 text-sm mt-3">{error}</p>}
          </>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const heroRef = useReveal(0.05);
  const statsRef = useReveal(0.1);
  const [scrollY, setScrollY] = useState(0);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string; img: string; count: number }[]>([]);

  useEffect(() => {
    fetchProducts().then(all => {
      setCategories(
        Object.entries(CATEGORY_IMGS).map(([id, info]) => ({
          ...info,
          count: all.filter(p => p.category_id === id).length,
        }))
      );
    });
    fetchFeaturedProducts().then(setFeatured);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.25}px)`, willChange: "transform" }}>
          <Image src="/products/lv-trainer.webp" alt="iDoh Elite" fill className="object-cover opacity-25" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#FF9D3D] to-transparent" />

        <div
          ref={heroRef as React.RefObject<HTMLDivElement>}
          className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40 w-full reveal"
          style={{ transitionDelay: "100ms" }}
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              {["Sport", "Luxe", "Streetwear"].map((tag, i) => (
                <span key={tag} className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded ${
                  i === 1 ? "bg-[#FF9D3D]/20 border border-[#FF9D3D]/40 text-[#FF9D3D]" : "bg-white/10 text-white/60"
                }`}>{tag}</span>
              ))}
            </div>

            <h1
              className="font-condensed text-white leading-none mb-6 font-black uppercase animate-fade-up delay-100"
              style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)", letterSpacing: "-0.02em" }}
            >
              BUILT FOR
              <br />
              <span className="text-[#FF9D3D]">THE ELITE</span>
            </h1>

            <p className="text-white/90 mb-2 text-xl font-bold animate-fade-up delay-200">
              Les meilleures pièces du game.
            </p>
            <p className="text-white/50 mb-10 max-w-sm text-sm leading-relaxed animate-fade-up delay-300">
              Maillots. Sneakers de luxe. Streetwear. Tout ce que tu veux — iDoh ELITE a ce que les autres n&apos;ont pas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
              <Link href="/products"
                className="inline-flex items-center justify-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded transition-all duration-200 active:scale-[0.97] hover:gap-3">
                Accéder à la collection <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/products?cat=chaussure"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white border-2 border-white/30 rounded hover:border-[#FF9D3D] hover:bg-[#FF9D3D]/10 transition-all duration-200">
                Sneakers & Luxe
              </Link>
            </div>

            <p className="text-white/25 text-xs mt-5 animate-fade-up delay-300">
              ★★★★★ +500 clients satisfaits · Livraison rapide · 100% authentique
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          ref={statsRef as React.RefObject<HTMLDivElement>}
          className="absolute bottom-0 left-0 right-0 bg-[#111111]/80 backdrop-blur-sm border-t border-white/10 reveal"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              {[
                { value: "10+", label: "Marques" },
                { value: "4.8★", label: "Note moyenne" },
                { value: "500+", label: "Clients satisfaits" },
              ].map((stat) => (
                <div key={stat.label} className="px-4 sm:px-8 text-center">
                  <div className="font-condensed font-black text-[#FF9D3D] text-2xl">{stat.value}</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROMESSES ══ */}
      <section className="bg-[#FF9D3D] py-3">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between sm:justify-center sm:gap-16">
            {[
              { Icon: Truck,       label: "Livraison dès 70€",   sub: "Mondial Relay · Colissimo" },
              { Icon: ShieldCheck, label: "100% authentique",     sub: "Qualité garantie" },
              { Icon: Lock,        label: "Paiement sécurisé",    sub: "Données protégées" },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2 text-white">
                <Icon className="w-4 h-4 flex-shrink-0 sm:w-5 sm:h-5" />
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-sm font-bold block leading-tight truncate">{label}</span>
                  <span className="text-[9px] sm:text-[11px] text-white/70 uppercase tracking-wide hidden sm:block">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MARQUES ══ */}
      <BrandMarquee />

      {/* ══ ADN iDoh ══ */}
      <section className="bg-[#1a1a1a]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <RevealDiv className="text-center mb-12">
            <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">Notre identité</span>
            <h2 className="font-condensed font-black uppercase text-white mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
              L&apos;ADN iDoh ELITE
            </h2>
            <p className="text-white/40 max-w-sm mx-auto text-sm">
              Trois univers. Un seul mot : le meilleur.
            </p>
          </RevealDiv>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Sport */}
            <RevealDiv delay={0} className="relative group overflow-hidden rounded-xl aspect-[4/5] cursor-pointer">
              <Image src="/products/france-away-clean.webp" alt="Sport" fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-50"
                sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest mb-2">01 · Sport</span>
                <h3 className="font-condensed font-black uppercase text-white text-3xl mb-2">Maillots</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-1">
                  Le maillot France 2026. Le maillot Haïti. Les vrais, les officiels.
                </p>
                <p className="text-white font-semibold text-sm mb-4">Porte les couleurs qui comptent.</p>
                <Link href="/products?cat=maillot"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF9D3D] hover:gap-3 transition-all duration-200">
                  Voir les maillots <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </RevealDiv>

            {/* Luxe */}
            <RevealDiv delay={100} className="relative group overflow-hidden rounded-xl aspect-[4/5] cursor-pointer">
              <Image src="/products/lv-trainer.webp" alt="Luxe" fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-50"
                sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF9D3D]" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest mb-2">02 · Luxe</span>
                <h3 className="font-condensed font-black uppercase text-white text-3xl mb-2">Collector</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-1">
                  Louis Vuitton. Burberry. Jordan × KAWS. Des pièces rares que tout le monde veut.
                </p>
                <p className="text-white font-semibold text-sm mb-4">Une fois parti, c&apos;est parti.</p>
                <Link href="/products?cat=chaussure"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF9D3D] hover:gap-3 transition-all duration-200">
                  Voir les pièces <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </RevealDiv>

            {/* Streetwear */}
            <RevealDiv delay={200} className="relative group overflow-hidden rounded-xl aspect-[4/5] cursor-pointer">
              <Image src="/products/nb610-1.webp" alt="Streetwear" fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-50"
                sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest mb-2">03 · Streetwear</span>
                <h3 className="font-condensed font-black uppercase text-white text-3xl mb-2">Culture</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-1">
                  Nike. New Balance. Off-White. Le style que tout le monde reconnaît dans la rue.
                </p>
                <p className="text-white font-semibold text-sm mb-4">Habille-toi. Fais parler de toi.</p>
                <Link href="/products?cat=tshirt"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF9D3D] hover:gap-3 transition-all duration-200">
                  Voir la sélection <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </RevealDiv>
          </div>
        </div>
      </section>

      {/* ══ COLLECTIONS ══ */}
      <section className="py-16 lg:py-24 bg-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <RevealDiv className="text-center mb-12">
            <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">Collections</span>
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
              Nos Collections
            </h2>
            <p className="text-[#999999] text-sm">C&apos;est quoi ton style ? Choisis ton univers.</p>
          </RevealDiv>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <RevealDiv key={cat.name} delay={i * 80}>
                <Link href={`/products?cat=${cat.slug}`}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-[#f5f5f5] block">
                  <Image src={cat.img} alt={cat.name} fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 via-[#1a1a1a]/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-condensed font-black uppercase text-white text-xl">{cat.name}</h3>
                    <p className="text-white/60 text-xs mt-0.5">
                      {cat.count > 0 ? `${cat.count} produit${cat.count > 1 ? "s" : ""}` : "Bientôt disponible"}
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FF9D3D] flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </Link>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MEILLEURES VENTES ══ */}
      <section className="py-16 lg:py-24 bg-[#f5f5f5]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <RevealDiv className="mb-12">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">Sélection</span>
                <h2 className="font-condensed font-black uppercase text-[#1a1a1a]" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
                  Meilleures ventes
                </h2>
              </div>
              <Link href="/products" className="text-sm font-semibold text-[#FF9D3D] hover:text-[#FFB366] flex items-center gap-1 transition-colors whitespace-nowrap ml-4 group">
                Tout voir <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="text-[#999999] text-sm mt-2">
              Ces pièces se vendent vite.{" "}
              <span className="text-[#1a1a1a] font-semibold">+500 clients</span> les ont déjà pris. Fais vite.
            </p>
          </RevealDiv>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <RevealDiv key={product.id} delay={i * 80}>
                <ProductCard product={product} />
              </RevealDiv>
            ))}
          </div>

          <RevealDiv className="text-center mt-12">
            <p className="text-[#999999] text-sm mb-4">
              T&apos;as vu que 4 pièces.{" "}
              <span className="text-[#1a1a1a] font-semibold">Il en reste encore.</span>
            </p>
            <Link href="/products"
              className="inline-flex items-center gap-2 border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white font-bold uppercase tracking-widest text-sm px-8 py-3.5 rounded transition-all duration-200">
              Voir tout le catalogue <ArrowRight className="w-4 h-4" />
            </Link>
          </RevealDiv>
        </div>
      </section>

      {/* ══ NEWSLETTER ══ */}
      <NewsletterSection />

      {/* ══ CONFIANCE ══ */}
      <RevealSection className="bg-white py-12 border-y border-[#e0e0e0]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                Icon: ShieldCheck,
                title: "Que du vrai",
                body: "Chaque pièce est vérifiée avant d'arriver chez toi. La qualité, c'est notre priorité. C'est notre promesse."
              },
              {
                Icon: Clock,
                title: "Les stocks ne durent pas",
                body: "On ne refait pas les commandes à l'infini. Quand c'est parti, c'est parti. T'as été prévenu."
              },
              {
                Icon: Star,
                title: "4.8/5 — +500 avis",
                body: "Pas des avis inventés. De vrais clients, comme toi. Lis ce qu'ils disent. Rejoins-les."
              },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FF9D3D]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#FF9D3D]" />
                </div>
                <h3 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wider">{title}</h3>
                <p className="text-[#999999] text-sm leading-relaxed max-w-xs">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ══ TÉMOIGNAGES ══ */}
      <RevealSection className="bg-[#f5f5f5] py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <RevealDiv className="text-center mb-12">
            <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">Ils en parlent</span>
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] mb-2" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
              +500 clients satisfaits
            </h2>
            <div className="flex items-center justify-center gap-1 text-[#FF9D3D]">
              {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
              <span className="text-[#999999] text-sm ml-2 font-normal">4.8 / 5</span>
            </div>
          </RevealDiv>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Karim B.", city: "Paris", rating: 5, text: "Les Jordan KAWS sont incroyables, exactement comme sur les photos. Livraison rapide, emballage soigné. Je recommande à 100%.", product: "Jordan × KAWS", avatar: "K" },
              { name: "Mélissa T.", city: "Lyon", rating: 5, text: "Le maillot France est trop beau, la qualité est vraiment au rendez-vous. J'ai commandé pour mon frère et il a adoré !", product: "Maillot France Away", avatar: "M" },
              { name: "Dylan R.", city: "Marseille", rating: 5, text: "Sérieux c'est top ! Le Burberry est authentique, j'ai vérifié. Livré en 4 jours. iDoh ELITE c'est ma nouvelle boutique.", product: "Burberry Collab", avatar: "D" },
              { name: "Inès K.", city: "Bordeaux", rating: 5, text: "Je cherchais des NB610 depuis longtemps, impossible de les trouver ailleurs. Arrivées parfaites, service client réactif.", product: "New Balance 610", avatar: "I" },
              { name: "Théo M.", city: "Lille", rating: 5, text: "Qualité premium, pas de fake. J'ai hésité à commander en ligne mais le retour facile m'a convaincu. Zero regret.", product: "Maillot Haïti", avatar: "T" },
              { name: "Sara L.", city: "Nantes", rating: 4, text: "Très bon rapport qualité/prix, les pièces sont exactement comme décrites. Livraison un peu longue mais ça valait l'attente.", product: "Jordan × KAWS", avatar: "S" },
            ].map(({ name, city, rating, text, product, avatar }) => (
              <RevealDiv key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-[#e0e0e0]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF9D3D] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a] text-sm">{name}</p>
                    <p className="text-[#999999] text-xs">{city}</p>
                  </div>
                  <div className="ml-auto text-[#FF9D3D] text-xs">{"★".repeat(rating)}</div>
                </div>
                <p className="text-[#555] text-sm leading-relaxed mb-3">&ldquo;{text}&rdquo;</p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9D3D] bg-[#FF9D3D]/10 px-2.5 py-1 rounded-full">
                  {product}
                </span>
              </RevealDiv>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ══ CTA FINAL ══ */}
      <RevealSection className="relative py-24 lg:py-32 bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/products/jordan-kaws-2.webp" alt="Jordan KAWS" fill className="object-cover opacity-20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/60 via-transparent to-[#1a1a1a]/60" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-4">Sport · Luxe · Streetwear</span>
          <h2
            className="font-condensed font-black uppercase text-white mb-5"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", letterSpacing: "-0.02em" }}
          >
            NE JAMAIS S&apos;ARRÊTER
          </h2>
          <p className="text-white text-lg font-semibold mb-2">
            Les pièces que tout le monde veut sont ici.
          </p>
          <p className="text-white/50 mb-3 max-w-sm mx-auto text-sm">
            Les stocks partent vite. C&apos;est maintenant ou jamais.
          </p>
          <p className="text-[#FF9D3D] font-bold mb-10 text-sm uppercase tracking-wider">
            T&apos;attends quoi ?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products"
              className="inline-flex items-center justify-center gap-3 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-sm px-10 py-4 rounded transition-all duration-200 hover:gap-4 group">
              Voir le catalogue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/products?cat=chaussure"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-semibold uppercase tracking-wider text-white border-2 border-white/30 rounded hover:border-[#FF9D3D] hover:bg-[#FF9D3D]/10 transition-all duration-200">
              Sneakers exclusives
            </Link>
          </div>
          <p className="text-white/20 text-xs mt-8">
            ✓ Livraison rapide &nbsp;·&nbsp; ✓ 100% authentique &nbsp;·&nbsp; ✓ Retours sous 30 jours
          </p>
        </div>
      </RevealSection>

      {/* ── Réseaux sociaux ── */}
      <RevealSection>
        <div className="bg-[#111111] border-y border-white/8 py-10">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Texte gauche */}
              <div className="text-center sm:text-left">
                <p className="text-[#FF9D3D] text-[10px] font-bold uppercase tracking-widest mb-1">Communauté</p>
                <h2 className="font-condensed font-black uppercase text-white text-2xl leading-tight">
                  Rejoins-nous<br className="sm:hidden" /> sur les réseaux
                </h2>
              </div>

              {/* 3 icônes côte à côte */}
              <div className="flex items-center gap-5">
                {/* Instagram */}
                <a href="https://www.instagram.com/idoh_elite?igsh=MWxzM3k5NWN6cTV6bg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#515BD4] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                </a>

                {/* TikTok */}
                <a href="https://www.tiktok.com/@idoh_elite_luxury" target="_blank" rel="noopener noreferrer"
                  className="group">
                  <div className="w-14 h-14 rounded-2xl bg-black border border-white/15 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                    </svg>
                  </div>
                </a>

                {/* Snapchat */}
                <a href="https://www.snapchat.com/@idoh_elite" target="_blank" rel="noopener noreferrer"
                  className="group">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFFC00] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <svg viewBox="0 0 24 24" fill="#000" className="w-7 h-7">
                      <path d="M12 2C8.8 2 6.3 4.2 6.3 7.8v2.6c-.5.2-1.1.4-1.6.4-.4 0-.7.3-.7.7s.3.7.7.7c.2 0 .6.1 1 .5-.4.8-1 1.8-1.7 2.3 0 0 1.3.7 3.8.9.2.4.5.9.7 1s.3.3.5.3.3-.2.5-.3c.3-.1.5-.6.7-1 2.5-.2 3.8-.9 3.8-.9-.7-.5-1.3-1.5-1.7-2.3.4-.4.8-.5 1-.5.4 0 .7-.3.7-.7s-.3-.7-.7-.7c-.5 0-1.1-.2-1.6-.4V7.8C17.7 4.2 15.2 2 12 2z"/>
                    </svg>
                  </div>
                </a>
              </div>

              {/* CTA droite */}
              <a
                href="https://www.instagram.com/idoh_elite?igsh=MWxzM3k5NWN6cTV6bg%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-2 border border-[#FF9D3D] text-[#FF9D3D] hover:bg-[#FF9D3D] hover:text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg transition-all duration-200"
              >
                Suivre iDoh ELITE →
              </a>
            </div>
          </div>
        </div>
      </RevealSection>

    </div>
  );
}
