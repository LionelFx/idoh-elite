"use client";

import { useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

interface GenerateProps {
  onResult: (text: string) => void;
  payload: Record<string, string>;
  label?: string;
  disabled?: boolean;
  disabledTitle?: string;
}

interface RewriteProps {
  getText: () => string;
  onResult: (text: string) => void;
  type: string;
  disabled?: boolean;
}

async function callAI(body: Record<string, unknown>): Promise<string | null> {
  const res = await fetch("/api/ai/generate-description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.ok ? json.text : null;
}

export function AiGenerateButton({ onResult, payload, label = "Générer avec l'IA", disabled, disabledTitle }: GenerateProps) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    const text = await callAI(payload);
    if (text) onResult(text);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading || disabled}
      title={disabled ? disabledTitle : label}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9D3D]/10 hover:bg-[#FF9D3D]/20 border border-[#FF9D3D]/30 hover:border-[#FF9D3D]/60 text-[#FF9D3D] text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      {loading ? "Génération…" : label}
    </button>
  );
}

export function AiRewriteButton({ getText, onResult, type, disabled }: RewriteProps) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    const text = getText().trim();
    if (!text) return;
    setLoading(true);
    const result = await callAI({ mode: "rewrite", type, text });
    if (result) onResult(result);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading || disabled}
      title="Retransformer avec l'IA"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white/50 hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
      {loading ? "Réécriture…" : "Retransformer"}
    </button>
  );
}
