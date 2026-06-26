"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Copy, Check } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

interface PromoCode {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
  active: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  code: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: "",
  min_order: "",
  expires_at: "",
  max_uses: "",
};

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    const { data } = await getSupabase().from("promo_codes").select("*").order("created_at", { ascending: false });
    setCodes((data ?? []) as PromoCode[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (key: keyof typeof EMPTY_FORM, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount_value) { setError("Code et valeur requis."); return; }
    setSaving(true);
    setError("");

    const payload = {
      code: form.code.toUpperCase().trim(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order: parseFloat(form.min_order) || 0,
      expires_at: form.expires_at || null,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      active: true,
    };

    const { error: err } = await getSupabase().from("promo_codes").insert(payload);
    if (err) {
      setError(err.message.includes("unique") ? "Ce code existe déjà." : err.message);
    } else {
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    }
    setSaving(false);
  };

  const toggleActive = async (code: PromoCode) => {
    await getSupabase().from("promo_codes").update({ active: !code.active }).eq("id", code.id);
    setCodes(prev => prev.map(c => c.id === code.id ? { ...c, active: !c.active } : c));
  };

  const deleteCode = async (id: string) => {
    await getSupabase().from("promo_codes").delete().eq("id", id);
    setCodes(prev => prev.filter(c => c.id !== id));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const inputCls = "w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#FF9D3D] placeholder-white/20 transition-colors";
  const labelCls = "text-white/50 text-xs uppercase tracking-wider block mb-2";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-condensed font-black uppercase text-white text-3xl">Codes Promos</h1>
          <p className="text-white/40 text-sm mt-1">Crée et gère les codes de réduction pour tes clients</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-wider text-sm rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouveau code
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-6 mb-8">
          <h2 className="font-condensed font-black uppercase text-white text-xl mb-6 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#FF9D3D]" /> Créer un code promo
          </h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Code */}
              <div className="lg:col-span-1">
                <label className={labelCls}>Code *</label>
                <input value={form.code} onChange={e => set("code", e.target.value.toUpperCase())}
                  placeholder="SUMMER20" className={`${inputCls} font-mono uppercase tracking-widest`} required />
              </div>

              {/* Type */}
              <div>
                <label className={labelCls}>Type de réduction *</label>
                <select value={form.discount_type} onChange={e => set("discount_type", e.target.value as "percent" | "fixed")} className={inputCls}>
                  <option value="percent">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (€)</option>
                </select>
              </div>

              {/* Valeur */}
              <div>
                <label className={labelCls}>Valeur * {form.discount_type === "percent" ? "(%)" : "(€)"}</label>
                <div className="relative">
                  <input type="number" min="0" max={form.discount_type === "percent" ? "100" : undefined}
                    step={form.discount_type === "percent" ? "1" : "0.01"}
                    value={form.discount_value} onChange={e => set("discount_value", e.target.value)}
                    placeholder={form.discount_type === "percent" ? "20" : "10.00"}
                    className={`${inputCls} pr-10`} required />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold">
                    {form.discount_type === "percent" ? "%" : "€"}
                  </span>
                </div>
              </div>

              {/* Commande min */}
              <div>
                <label className={labelCls}>Commande minimum (€)</label>
                <input type="number" min="0" step="0.01" value={form.min_order}
                  onChange={e => set("min_order", e.target.value)} placeholder="0"
                  className={inputCls} />
              </div>

              {/* Expiration */}
              <div>
                <label className={labelCls}>Date d&apos;expiration</label>
                <input type="date" value={form.expires_at} onChange={e => set("expires_at", e.target.value)}
                  className={`${inputCls} [color-scheme:dark]`} />
              </div>

              {/* Max utilisations */}
              <div>
                <label className={labelCls}>Utilisations max</label>
                <input type="number" min="1" value={form.max_uses} onChange={e => set("max_uses", e.target.value)}
                  placeholder="Illimité" className={inputCls} />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setError(""); setForm(EMPTY_FORM); }}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-semibold transition-colors cursor-pointer">
                Annuler
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Créer le code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des codes */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-7 h-7 border-2 border-[#FF9D3D] animate-spin text-[#FF9D3D]" />
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold">Aucun code promo pour l&apos;instant</p>
          <p className="text-xs mt-1">Clique sur &quot;Nouveau code&quot; pour en créer un.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map(code => {
            const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
            const isExhausted = code.max_uses !== null && code.uses_count >= code.max_uses;
            const statusOk = code.active && !isExpired && !isExhausted;

            return (
              <div key={code.id} className={`bg-[#141414] border rounded-xl p-4 sm:p-5 transition-all ${
                statusOk ? "border-white/8" : "border-white/5 opacity-60"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Code + badge */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-[#FF9D3D]/10 border border-[#FF9D3D]/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
                      <span className="font-mono font-black text-[#FF9D3D] tracking-widest text-sm">{code.code}</span>
                      <button onClick={() => copyCode(code.code)} className="text-[#FF9D3D]/50 hover:text-[#FF9D3D] cursor-pointer transition-colors">
                        {copied === code.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-white/8 text-white/70 text-xs font-bold px-2 py-0.5 rounded">
                        {code.discount_type === "percent" ? `-${code.discount_value}%` : `-${formatPrice(code.discount_value)}`}
                      </span>
                      {code.min_order > 0 && (
                        <span className="bg-white/5 text-white/40 text-xs px-2 py-0.5 rounded">min. {formatPrice(code.min_order)}</span>
                      )}
                      {isExpired && <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded">Expiré</span>}
                      {isExhausted && <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded">Épuisé</span>}
                      {!code.active && !isExpired && !isExhausted && (
                        <span className="bg-white/10 text-white/40 text-xs px-2 py-0.5 rounded">Inactif</span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-xs text-white/40 flex-shrink-0">
                    <div className="text-center">
                      <p className="font-bold text-white/70 text-base">{code.uses_count}</p>
                      <p>utilisations{code.max_uses ? ` / ${code.max_uses}` : ""}</p>
                    </div>
                    {code.expires_at && (
                      <div className="text-center hidden sm:block">
                        <p className="font-semibold text-white/50">{new Date(code.expires_at).toLocaleDateString("fr-FR")}</p>
                        <p>expiration</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(code)} className="cursor-pointer transition-colors"
                      title={code.active ? "Désactiver" : "Activer"}>
                      {code.active
                        ? <ToggleRight className="w-7 h-7 text-[#FF9D3D]" />
                        : <ToggleLeft className="w-7 h-7 text-white/30" />
                      }
                    </button>
                    <button onClick={() => deleteCode(code.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
