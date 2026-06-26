"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function CompteConfirmePage() {
  const [status, setStatus] = useState<"loading" | "confirmed" | "error">("loading");
  const resolved = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(async (event) => {
      if (resolved.current) return;
      if (event === "SIGNED_IN") {
        resolved.current = true;
        // Déconnecte immédiatement — le client doit se connecter manuellement
        await getSupabase().auth.signOut();
        setStatus("confirmed");
      }
    });

    // Si rien ne se passe en 8s, le lien est probablement expiré
    const timeout = setTimeout(() => {
      if (!resolved.current) setStatus("error");
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-24">
      <Link href="/" className="mb-10 font-condensed font-black uppercase tracking-widest text-2xl">
        <span className="text-[#FF9D3D]">iDoh</span><span className="text-white"> ELITE</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-10 text-center">

          {status === "loading" && (
            <div className="space-y-4">
              <div className="w-14 h-14 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white font-semibold">Confirmation en cours…</p>
              <p className="text-white/30 text-sm">Ne ferme pas cette page.</p>
            </div>
          )}

          {status === "confirmed" && (
            <div className="space-y-5">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <div>
                <h1 className="font-condensed font-black uppercase text-white text-2xl mb-2">
                  Compte confirmé !
                </h1>
                <p className="text-white/40 text-sm leading-relaxed">
                  Ton adresse email a bien été vérifiée.<br />
                  Tu fais maintenant partie de l&apos;élite.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/compte"
                  className="block w-full bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-sm py-3.5 rounded-xl transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-5">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                <X className="w-9 h-9 text-red-400" />
              </div>
              <div>
                <h1 className="font-condensed font-black uppercase text-white text-2xl mb-2">
                  Lien invalide
                </h1>
                <p className="text-white/40 text-sm leading-relaxed">
                  Ce lien de confirmation est expiré ou déjà utilisé.<br />
                  Essaie de te connecter directement.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/compte"
                  className="block w-full bg-white/8 hover:bg-white/12 text-white font-bold uppercase tracking-widest text-sm py-3.5 rounded-xl transition-colors border border-white/10"
                >
                  Retour à la connexion
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
