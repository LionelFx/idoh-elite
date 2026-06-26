"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, Trash2, Mail, CheckCircle2, Clock } from "lucide-react";
import type { ContactMessage } from "@/types";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contact-messages")
      .then(r => r.json())
      .then(j => {
        setMessages(j.messages ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const nouveaux = messages.filter(m => m.status === "nouveau");

  const handleReply = async (id: string) => {
    const reply = replies[id]?.trim();
    if (!reply) return;
    setSending(id);
    const res = await fetch("/api/contact-messages/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, reply }),
    });
    const json = await res.json();
    setSending(null);
    if (json.ok) {
      setMessages(prev =>
        prev.map(m => (m.id === id ? { ...m, status: "repondu", admin_reply: reply, replied_at: new Date().toISOString() } : m))
      );
      setReplies(prev => ({ ...prev, [id]: "" }));
    }
  };

  const handleDelete = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    await fetch("/api/contact-messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-condensed font-black uppercase text-white text-3xl">Messages</h1>
        <p className="text-white/40 text-sm mt-1">
          {nouveaux.length} nouveau{nouveaux.length > 1 ? "x" : ""} · {messages.length} au total
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#FF9D3D] animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Aucun message pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => {
            const isNew = msg.status === "nouveau";
            const isOpen = isNew || expanded === msg.id;
            return (
              <div key={msg.id} className={`bg-[#141414] border rounded-2xl overflow-hidden ${isNew ? "border-[#FF9D3D]/30" : "border-white/8"}`}>
                <div
                  onClick={() => !isNew && setExpanded(expanded === msg.id ? null : msg.id)}
                  className={`flex items-start justify-between gap-4 px-5 py-4 ${!isNew ? "cursor-pointer hover:bg-white/3" : ""} transition-colors`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isNew ? (
                        <span className="flex items-center gap-1 text-[#FF9D3D] text-[10px] font-bold uppercase tracking-wider bg-[#FF9D3D]/10 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Nouveau
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold uppercase tracking-wider bg-green-400/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Répondu
                        </span>
                      )}
                      <span className="text-white/30 text-xs">
                        {new Date(msg.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm truncate">
                      {msg.name} <span className="text-white/40 font-normal">· {msg.email}</span>
                    </p>
                    {msg.subject && <p className="text-white/30 text-xs mt-0.5">{msg.subject}</p>}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(msg.id); }}
                    className="text-white/20 hover:text-red-400 transition-colors p-1 cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 space-y-4">
                    <div className="bg-[#1a1a1a] rounded-xl px-4 py-3">
                      <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>

                    {isNew ? (
                      <div className="space-y-2">
                        <textarea
                          value={replies[msg.id] ?? ""}
                          onChange={e => setReplies(prev => ({ ...prev, [msg.id]: e.target.value }))}
                          rows={4}
                          placeholder={`Réponds à ${msg.name}…`}
                          className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF9D3D] placeholder-white/20 transition-colors resize-none"
                        />
                        <button
                          onClick={() => handleReply(msg.id)}
                          disabled={sending === msg.id || !replies[msg.id]?.trim()}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {sending === msg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          {sending === msg.id ? "Envoi…" : "Envoyer la réponse"}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-[#FF9D3D]/5 border border-[#FF9D3D]/15 rounded-xl px-4 py-3">
                        <p className="text-[#FF9D3D] text-[10px] font-bold uppercase tracking-wider mb-1.5">Ta réponse</p>
                        <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{msg.admin_reply}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
