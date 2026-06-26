"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function ContactPage() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      addToast("Remplis tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSent(true);
      addToast("Message envoyé ! On te répond sous 24h.");
    } catch {
      addToast("Erreur d'envoi, réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-lg border border-[#e0e0e0] bg-[#f5f5f5] text-sm text-[#1a1a1a] outline-none focus:border-[#FF9D3D] focus:bg-white transition-colors";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-12 lg:pb-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <span className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest block mb-2">On est là</span>
          <h1 className="font-condensed font-black uppercase text-white mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Contacte-nous
          </h1>
          <p className="text-white/50 text-sm max-w-md">
            Une question sur une pièce ? Un problème de commande ? On répond sous 24h, toujours.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Infos contact */}
          <div className="space-y-8">
            <div>
              <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl mb-6">Nos coordonnées</h2>
              <div className="space-y-5">
                {[
                  { Icon: Mail,   label: "Email",     value: "idohelite@gmail.com",     sub: "Réponse sous 24h",  href: "mailto:idohelite@gmail.com" },
                  { Icon: Phone,  label: "Téléphone", value: "+33 7 59 88 76 00",        sub: "Lun–Ven, 9h–18h",   href: "tel:+33759887600" },
                  { Icon: MapPin, label: "Adresse",   value: "Paris, France",            sub: "Sur rendez-vous",    href: undefined },
                ].map(({ Icon, label, value, sub, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FF9D3D]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#FF9D3D]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#999999] mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-semibold text-[#1a1a1a] hover:text-[#FF9D3D] transition-colors">{value}</a>
                      ) : (
                        <p className="text-sm font-semibold text-[#1a1a1a]">{value}</p>
                      )}
                      <p className="text-xs text-[#999999]">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ rapide */}
            <div className="bg-[#f5f5f5] rounded-xl p-6">
              <h3 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wider mb-4">Questions fréquentes</h3>
              <div className="space-y-3">
                {[
                  { q: "Délai de livraison ?",            r: "Standard 3–5j France · 3–7j UE (Mondial Relay / Colissimo) · Express 72h France uniquement (+4,99€)" },
                  { q: "Les produits sont authentiques ?", r: "Oui, 100% garantis." },
                  { q: "Politique de retours ?",           r: "30 jours après réception." },
                ].map(({ q, r }) => (
                  <div key={q}>
                    <p className="text-xs font-semibold text-[#1a1a1a]">{q}</p>
                    <p className="text-xs text-[#999999]">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-2xl mb-3">Message envoyé !</h2>
                <p className="text-[#999999] text-sm">On te répond sous 24h. Merci {form.name} 👊</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                      Nom <span className="text-[#FF9D3D]">*</span>
                    </label>
                    <input type="text" placeholder="Ton nom" value={form.name}
                      onChange={e => set("name", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                      Email <span className="text-[#FF9D3D]">*</span>
                    </label>
                    <input type="email" placeholder="ton@email.fr" value={form.email}
                      onChange={e => set("email", e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">Sujet</label>
                  <select value={form.subject} onChange={e => set("subject", e.target.value)} className={inputCls}>
                    <option value="">Choisir un sujet</option>
                    <option>Question sur un produit</option>
                    <option>Suivi de commande</option>
                    <option>Retour / échange</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                    Message <span className="text-[#FF9D3D]">*</span>
                  </label>
                  <textarea rows={6} placeholder="Dis-nous tout…" value={form.message}
                    onChange={e => set("message", e.target.value)}
                    className={`${inputCls} resize-none`} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-sm py-4 rounded-lg transition-all duration-200 disabled:opacity-60 cursor-pointer active:scale-[0.98]">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Envoyer le message</>
                  )}
                </button>

                <p className="text-center text-xs text-[#999999]">
                  On répond à chaque message. Sous 24h, sans exception.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
