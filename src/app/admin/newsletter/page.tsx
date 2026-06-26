"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, Sparkles, Users, Trash2 } from "lucide-react";
import { AiRewriteButton } from "@/components/admin/AiButtons";

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  active: boolean;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  useEffect(() => {
    fetch("/api/newsletter/subscribers")
      .then(r => r.json())
      .then(j => {
        setSubscribers(j.subscribers ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUnsubscribe = async (id: string) => {
    await fetch("/api/newsletter/subscribers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: false }),
    });
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, active: false } : s));
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/newsletter/subscribers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSubscribers(prev => prev.filter(s => s.id !== id));
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    const res = await fetch("/api/ai/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: aiTopic, type: "newsletter", subject: aiTopic }),
    });
    const json = await res.json();
    if (json.ok) setContent(json.text);
    setGenerating(false);
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) return;
    setSending(true);
    setResult(null);
    const res = await fetch("/api/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, html: content }),
    });
    const json = await res.json();
    setSending(false);
    if (json.ok) setResult({ sent: json.sent, failed: json.failed });
  };

  const active = subscribers.filter(s => s.active);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-condensed font-black uppercase text-white text-3xl">Newsletter</h1>
        <p className="text-white/40 text-sm mt-1">{active.length} abonné{active.length > 1 ? "s" : ""} actif{active.length > 1 ? "s" : ""}</p>
      </div>

      {/* Compositeur */}
      <div className="bg-[#141414] border border-white/8 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Send className="w-5 h-5 text-[#FF9D3D]" /> Composer et envoyer
        </h2>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white/40 text-xs uppercase tracking-wider">Sujet de l'email</label>
            <AiRewriteButton getText={() => subject} onResult={setSubject} type="newsletter-subject" disabled={!subject.trim()} />
          </div>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Ex : Nouveau drop exclusif — Été 2026"
            className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF9D3D] placeholder-white/20 transition-colors"
          />
        </div>

        {/* Génération IA */}
        <div className="bg-[#FF9D3D]/5 border border-[#FF9D3D]/20 rounded-xl p-4 space-y-3">
          <p className="text-[#FF9D3D] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Générer le contenu avec l'IA
          </p>
          <div className="flex gap-2">
            <input
              value={aiTopic}
              onChange={e => setAiTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generateWithAI()}
              placeholder="Sujet à traiter : nouveau drop, offre flash, collab…"
              className="flex-1 bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#FF9D3D] placeholder-white/20 transition-colors"
            />
            <button onClick={generateWithAI} disabled={generating || !aiTopic.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9D3D] hover:bg-[#FFB366] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Génération…" : "Générer"}
            </button>
          </div>
          <p className="text-white/20 text-xs">Le contenu généré s'insère dans la zone ci-dessous — modifie-le librement avant d'envoyer.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white/40 text-xs uppercase tracking-wider">Contenu</label>
            <AiRewriteButton getText={() => content} onResult={setContent} type="newsletter" disabled={!content.trim()} />
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={10}
            placeholder="Écris ou génère le contenu de ta newsletter…"
            className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF9D3D] placeholder-white/20 transition-colors resize-none" />
        </div>

        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
            ✓ Envoyé à <strong>{result.sent}</strong> abonné{result.sent > 1 ? "s" : ""}
            {result.failed > 0 && <span className="text-yellow-400 ml-2">· {result.failed} échec{result.failed > 1 ? "s" : ""}</span>}
          </div>
        )}

        <button onClick={handleSend}
          disabled={sending || !subject.trim() || !content.trim() || active.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-wider text-sm rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? "Envoi…" : `Envoyer à ${active.length} abonné${active.length > 1 ? "s" : ""}`}
        </button>
      </div>

      {/* Liste abonnés */}
      <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-5">
          <Users className="w-5 h-5 text-[#FF9D3D]" /> Abonnés ({subscribers.length})
        </h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-[#FF9D3D] animate-spin" /></div>
        ) : subscribers.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">Aucun abonné pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {subscribers.map(sub => (
              <div key={sub.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-[#1a1a1a] rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.active ? "bg-green-500" : "bg-white/20"}`} />
                  <span className="text-white text-sm truncate">{sub.email}</span>
                  {!sub.active && <span className="text-white/30 text-xs flex-shrink-0">désabonné</span>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-white/30 text-xs">{new Date(sub.subscribed_at).toLocaleDateString("fr-FR")}</span>
                  {sub.active && (
                    <button onClick={() => handleUnsubscribe(sub.id)} title="Désabonner"
                      className="text-white/20 hover:text-yellow-400 transition-colors px-2 py-1 rounded text-xs cursor-pointer">
                      OFF
                    </button>
                  )}
                  <button onClick={() => handleDelete(sub.id)} title="Supprimer"
                    className="text-white/20 hover:text-red-400 transition-colors p-1 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
