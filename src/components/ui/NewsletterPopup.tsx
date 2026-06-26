"use client";

import { useState, useEffect } from "react";
import { X, Mail, Zap } from "lucide-react";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("nl_dismissed")) return;
    const t = setTimeout(() => setVisible(true), 6000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem("nl_dismissed", "1");
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, discount: true }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.ok) {
      setDone(true);
      localStorage.setItem("nl_dismissed", "1");
      setTimeout(() => setVisible(false), 2500);
    } else {
      setError(json.error ?? "Une erreur est survenue.");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-2xl overflow-hidden w-full max-w-md shadow-2xl animate-fade-up">
        {/* Orange top bar */}
        <div className="h-1 bg-gradient-to-r from-[#FF9D3D] via-[#FFB366] to-[#FF9D3D]" />

        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#FF9D3D]/15 border border-[#FF9D3D]/30 rounded-full px-3 py-1 mb-5">
            <Zap className="w-3.5 h-3.5 text-[#FF9D3D]" />
            <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest">Offre exclusive</span>
          </div>

          {!done ? (
            <>
              <h2 className="font-condensed font-black uppercase text-white text-3xl leading-none mb-2">
                -10% sur<br />
                <span className="text-[#FF9D3D]">ta première commande</span>
              </h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Inscris-toi et reçois ton code promo immédiatement. Nouveaux drops & offres privées en avant-première.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-lg px-4 py-3 focus-within:border-[#FF9D3D] transition-colors">
                  <Mail className="w-4 h-4 text-white/30 flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="ton@email.fr"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
                    required
                  />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-sm py-3.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                >
                  {loading ? "…" : "Obtenir mon -10%"}
                </button>
              </form>

              <p className="text-white/25 text-[11px] text-center mt-3">
                Sans spam. Désabonnement en 1 clic.
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-condensed font-black uppercase text-white text-2xl mb-2">
                Bienvenue dans l&apos;élite !
              </h3>
              <p className="text-white/60 text-sm mb-2">
                Ton code -10% vient de t&apos;être envoyé par mail — <span className="text-[#FF9D3D] font-bold">valable 24h seulement</span>.
              </p>
              <p className="text-yellow-400/70 text-xs">
                Tu ne le vois pas ? Vérifie ton dossier <strong className="text-yellow-400">spam</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
