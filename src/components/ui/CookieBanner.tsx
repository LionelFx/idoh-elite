"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem("cookie_consent", "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] p-4 lg:p-6">
      <div className="max-w-2xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-5 h-5 text-[#FF9D3D] flex-shrink-0 mt-0.5" />
          <p className="text-white/70 text-xs leading-relaxed">
            On utilise des cookies pour améliorer ton expérience et analyser le trafic.{" "}
            <a href="/legal/confidentialite" className="text-[#FF9D3D] underline underline-offset-2">
              En savoir plus
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={refuse}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white border border-white/15 hover:border-white/30 rounded-lg transition-colors cursor-pointer"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#FF9D3D] hover:bg-[#FFB366] text-white rounded-lg transition-colors cursor-pointer"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
