"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Loader2, ShieldCheck,
  Package, User, ChevronRight,
  Clock, CheckCircle, Truck, AlertCircle,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";

type Tab = "login" | "register";

const STATUS_CONFIG = {
  pending:   { label: "En attente", color: "text-yellow-600 bg-yellow-100", icon: Clock },
  confirmed: { label: "Confirmée",  color: "text-blue-600 bg-blue-100",    icon: CheckCircle },
  shipped:   { label: "Expédiée",   color: "text-purple-600 bg-purple-100", icon: Truck },
  delivered: { label: "Livrée",     color: "text-green-600 bg-green-100",  icon: CheckCircle },
  cancelled: { label: "Annulée",    color: "text-red-600 bg-red-100",      icon: AlertCircle },
} as const;

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  delivery_method: string;
}

function ComptePageInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/compte";

  // Auth form state
  const [tab, setTab] = useState<Tab>("login");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Dashboard state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    getSupabase()
      .from("orders")
      .select("id, order_number, total, status, created_at, delivery_method")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => { setOrders(data ?? []); setOrdersLoading(false); });
  }, [user]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    await fetch("/api/email/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    setForgotSent(true);
    setForgotLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    const { error: err } = await getSupabase().auth.signInWithPassword({ email: form.email, password: form.password });
    setSubmitting(false);
    if (err) { setError("Email ou mot de passe incorrect."); return; }
    router.push(redirect);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!json.ok) { setError(json.error ?? "Une erreur est survenue."); return; }
    setForm({ firstName: "", lastName: "", email: "", password: "" });
    setSuccess("Compte créé ! Vérifie ton email pour confirmer ton inscription.");
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── CONNECTÉ : Dashboard ──────────────────────────────────────────────────
  if (user) {
    const firstName = (user.user_metadata?.first_name as string) || user.email?.split("@")[0] || "toi";

    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <p className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest mb-2">Mon compte</p>
            <h1 className="font-condensed font-black uppercase text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              Bonjour, {firstName} 👋
            </h1>
            <p className="text-white/40 text-sm mt-2">{user.email}</p>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Cartes navigation */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <Link href="/compte/commandes" className="bg-white rounded-xl p-6 border border-[#e0e0e0] hover:border-[#FF9D3D] hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <Package className="w-8 h-8 text-[#FF9D3D] mb-3" />
                  <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl">Mes commandes</h2>
                  <p className="text-[#999] text-sm mt-1">Suivre et consulter mes achats</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#ccc] group-hover:text-[#FF9D3D] transition-colors" />
              </div>
            </Link>
            <Link href="/compte/profil" className="bg-white rounded-xl p-6 border border-[#e0e0e0] hover:border-[#FF9D3D] hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <User className="w-8 h-8 text-[#FF9D3D] mb-3" />
                  <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl">Mon profil</h2>
                  <p className="text-[#999] text-sm mt-1">Gérer mes informations personnelles</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#ccc] group-hover:text-[#FF9D3D] transition-colors" />
              </div>
            </Link>
          </div>

          {/* Dernières commandes */}
          <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-2xl mb-4">Dernières commandes</h2>
          {ordersLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl p-10 border border-[#e0e0e0] text-center">
              <Package className="w-10 h-10 text-[#ccc] mx-auto mb-3" />
              <p className="text-[#999] font-semibold">Aucune commande pour l&apos;instant</p>
              <Link href="/products" className="inline-block mt-4 text-[#FF9D3D] font-bold text-sm hover:underline">
                Découvrir la collection →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <Link key={order.id} href={`/compte/commandes/${order.id}`}
                    className="bg-white rounded-xl p-5 border border-[#e0e0e0] hover:border-[#FF9D3D] hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-[#FF9D3D]">{order.order_number}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-[#999] text-xs mt-1">
                        {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                        {" · "}{order.delivery_method.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#1a1a1a]">{formatPrice(order.total)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#ccc] group-hover:text-[#FF9D3D] flex-shrink-0 transition-colors" />
                  </Link>
                );
              })}
              <Link href="/compte/commandes" className="block text-center text-[#FF9D3D] font-bold text-sm py-3 hover:underline">
                Voir toutes mes commandes →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DÉCONNECTÉ : Auth form ────────────────────────────────────────────────
  const inputCls = "w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#FF9D3D] placeholder-white/20 transition-colors";

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-24">
      <Link href="/" className="mb-10 font-condensed font-black uppercase tracking-widest text-2xl">
        <span className="text-[#FF9D3D]">iDoh</span><span className="text-white"> ELITE</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="flex bg-[#141414] border border-white/8 rounded-2xl p-1 mb-6">
          {(["login", "register"] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                tab === t ? "bg-[#FF9D3D] text-white" : "text-white/40 hover:text-white"
              }`}>
              {t === "login" ? "Se connecter" : "S'inscrire"}
            </button>
          ))}
        </div>

        <div className="bg-[#141414] border border-white/8 rounded-2xl p-8">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

          {tab === "register" && success ? (
            /* ── Compte créé ── */
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                <span className="text-green-400 text-2xl">✓</span>
              </div>
              <p className="text-white font-semibold">{success}</p>
              <p className="text-yellow-400/80 text-xs bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-3 py-2">
                Tu ne vois pas l&apos;email ? Vérifie ton dossier <strong className="text-yellow-400">spam</strong> ou courrier indésirable.
              </p>
              <button onClick={() => { setTab("login"); setSuccess(""); }}
                className="text-[#FF9D3D] text-sm font-bold hover:underline cursor-pointer">
                ← Retour à la connexion
              </button>
            </div>
          ) : tab === "login" ? (
            showForgot ? (
              /* ── Mot de passe oublié ── */
              forgotSent ? (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                    <span className="text-green-400 text-2xl">✓</span>
                  </div>
                  <p className="text-white font-semibold">Email envoyé !</p>
                  <p className="text-white/40 text-sm">Vérifie ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.</p>
                  <p className="text-yellow-400/80 text-xs bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-3 py-2">
                    Tu ne vois pas l&apos;email ? Vérifie ton dossier <strong className="text-yellow-400">spam</strong> ou courrier indésirable.
                  </p>
                  <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
                    className="text-[#FF9D3D] text-sm font-bold hover:underline cursor-pointer">
                    ← Retour à la connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-white/60 text-sm">Entre ton email pour recevoir un lien de réinitialisation.</p>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Email</label>
                    <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="ton@email.com" className={inputCls} />
                  </div>
                  <button type="submit" disabled={forgotLoading} className="w-full flex items-center justify-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] disabled:opacity-60 text-white font-bold uppercase tracking-widest text-sm py-3.5 rounded-xl transition-colors cursor-pointer">
                    {forgotLoading && <Loader2 className="w-4 h-4 animate-spin" />} Envoyer le lien
                  </button>
                  <button type="button" onClick={() => setShowForgot(false)} className="w-full text-white/30 hover:text-white text-sm transition-colors cursor-pointer">
                    ← Retour
                  </button>
                </form>
              )
            ) : (
              /* ── Connexion ── */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Email</label>
                  <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} placeholder="ton@email.com" className={inputCls} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/40 text-xs uppercase tracking-wider">Mot de passe</label>
                    <button type="button" onClick={() => setShowForgot(true)} className="text-white/30 hover:text-[#FF9D3D] text-xs transition-colors cursor-pointer">
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPwd ? "text" : "password"} required value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] disabled:opacity-60 text-white font-bold uppercase tracking-widest text-sm py-3.5 rounded-xl transition-colors cursor-pointer mt-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Se connecter
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Prénom</label>
                  <input required value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Jean" className={inputCls} />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Nom</label>
                  <input required value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Dupont" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Email</label>
                <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} placeholder="ton@email.com" className={inputCls} />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Mot de passe</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} required value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 caractères" className={`${inputCls} pr-11`} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] disabled:opacity-60 text-white font-bold uppercase tracking-widest text-sm py-3.5 rounded-xl transition-colors cursor-pointer mt-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Créer mon compte
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-white/20 hover:text-white/50 text-xs transition-colors">
            <ShieldCheck className="w-3.5 h-3.5" /> Accès administration
          </Link>
        </div>
      </div>
    </main>
  );
}

import { Suspense } from "react";

export default function ComptePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-7 h-7 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" /></div>}>
      <ComptePageInner />
    </Suspense>
  );
}
