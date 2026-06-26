const messages = [
  { icon: "🚚", text: "Livraison standard", highlight: "3–5j France · 3–7j UE" },
  { icon: "⚡", text: "Express 72h en France —", highlight: "+4,99€" },
  { icon: "🔥", text: "Stocks limités —", highlight: "Commande vite" },
  { icon: "🏆", text: "Sport · Luxe · Streetwear —", highlight: "Que de l'authentique" },
  { icon: "📦", text: "Colissimo · Mondial Relay · La Poste" },
  { icon: "🔒", text: "Paiement", highlight: "100% sécurisé" },
  { icon: "↩️", text: "Retours acceptés sous", highlight: "30 jours" },
  { icon: "⭐", text: "+500 commandes livrées ·", highlight: "Note 4.8/5" },
];

const doubled = [...messages, ...messages];

export default function AnnouncementBar() {
  return (
    <div className="h-9 bg-[#111111] border-b border-white/8 overflow-hidden flex items-center">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((msg, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-5 text-[11px] font-semibold">
            <span>{msg.icon}</span>
            <span className="text-white/70">{msg.text}</span>
            {msg.highlight && (
              <span className="text-[#FF9D3D] font-bold">{msg.highlight}</span>
            )}
            <span className="ml-3 text-[#FF9D3D]/30 text-xs">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
