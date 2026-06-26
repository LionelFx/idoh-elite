"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

const ADMIN_EMAIL    = "idohelite@gmail.com";
const ADMIN_PASSWORD = "iDoh@Elite2026";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [show, setShow]         = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== ADMIN_EMAIL) {
      setError("Accès refusé — email non autorisé.");
      return;
    }
    if (password !== ADMIN_PASSWORD) {
      setError("Mot de passe incorrect.");
      return;
    }
    localStorage.setItem("admin_auth", "idoh_admin_authenticated");
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-condensed font-black uppercase tracking-widest text-2xl">
            <span className="text-[#FF9D3D]">iDoh</span>
            <span className="text-white"> ELITE</span>
          </span>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Administration</p>
        </div>

        <div className="bg-[#141414] border border-white/10 rounded-2xl p-8">
          <div className="w-12 h-12 rounded-full bg-[#FF9D3D]/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-5 h-5 text-[#FF9D3D]" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@email.com"
                autoFocus
                className="w-full bg-[#1e1e1e] border border-white/10 focus:border-[#FF9D3D] rounded-lg px-4 py-3 text-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full bg-[#1e1e1e] border border-white/10 focus:border-[#FF9D3D] rounded-lg px-4 py-3 text-white text-sm outline-none transition-colors pr-10"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-widest text-sm py-3.5 rounded-lg transition-colors cursor-pointer mt-2"
            >
              Accéder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
