"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function NouveauMotDePassePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  // Supabase injecte le token dans l'URL via un hash fragment
  // onAuthStateChange détecte l'événement PASSWORD_RECOVERY
  useEffect(() => {
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Mot de passe trop court (min. 6 caractères)."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    const { error: err } = await getSupabase().auth.updateUser({ password });
    if (err) { setLoading(false); setError(err.message); return; }
    await getSupabase().auth.signOut();
    setLoading(false);
    setDone(true);
    setTimeout(() => router.push("/compte"), 2500);
  };

  const inputCls = "w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#FF9D3D] placeholder-white/20 transition-colors";

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-24">
      <Link href="/" className="mb-10 font-condensed font-black uppercase tracking-widest text-2xl">
        <span className="text-[#FF9D3D]">iDoh</span><span className="text-white"> ELITE</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-condensed font-black uppercase text-white text-xl">Mot de passe mis à jour !</h2>
              <p className="text-white/40 text-sm">Connecte-toi avec ton nouveau mot de passe.</p>
              <p className="text-white/20 text-xs">Redirection vers la connexion…</p>
            </div>
          ) : !ready ? (
            <div className="text-center space-y-3">
              <div className="w-7 h-7 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white/40 text-sm">Vérification du lien…</p>
              <p className="text-white/20 text-xs">Si rien ne se passe, le lien est peut-être expiré.<br />
                <button onClick={() => router.push("/compte")} className="text-[#FF9D3D] hover:underline cursor-pointer">Retour à la connexion</button>
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-condensed font-black uppercase text-white text-xl mb-1">Nouveau mot de passe</h2>
              <p className="text-white/40 text-sm mb-6">Choisis un mot de passe sécurisé.</p>

              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <input type={showPwd ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 caractères" className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Confirmer le mot de passe</label>
                  <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] disabled:opacity-60 text-white font-bold uppercase tracking-widest text-sm py-3.5 rounded-xl transition-colors cursor-pointer mt-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer le mot de passe
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
