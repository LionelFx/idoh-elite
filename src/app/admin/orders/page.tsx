"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle, Truck, AlertCircle, Search, ArrowRight } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  shipping_city: string;
  shipping_country: string;
  total: number;
  delivery_method: string;
  status: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "En attente",  color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",  icon: Clock },
  confirmed: { label: "Confirmée",   color: "text-blue-400 bg-blue-400/10 border-blue-400/20",        icon: CheckCircle },
  shipped:   { label: "Expédiée",    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",  icon: Truck },
  delivered: { label: "Livrée",      color: "text-green-400 bg-green-400/10 border-green-400/20",     icon: CheckCircle },
  cancelled: { label: "Annulée",     color: "text-red-400 bg-red-400/10 border-red-400/20",           icon: AlertCircle },
};

const FILTERS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabase()
      .from("orders")
      .select("id, order_number, customer_first_name, customer_last_name, customer_email, shipping_city, shipping_country, total, delivery_method, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, []);

  const filtered = orders.filter(o => {
    const matchFilter = filter === "all" || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.order_number?.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      `${o.customer_first_name} ${o.customer_last_name}`.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-condensed font-black uppercase text-white text-3xl">Commandes</h1>
          <p className="text-white/40 text-sm mt-1">{orders.length} commande{orders.length > 1 ? "s" : ""} au total</p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, numéro…"
            className="w-full bg-[#141414] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-[#FF9D3D] placeholder-white/20"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filter === f ? "bg-[#FF9D3D] text-white" : "bg-[#141414] border border-white/10 text-white/50 hover:text-white"
              }`}>
              {f === "all" ? "Tout" : STATUS_CONFIG[f]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">Aucune commande trouvée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Numéro", "Client", "Ville", "Livraison", "Montant", "Statut", "Date", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-[#FF9D3D] font-bold text-sm">{order.order_number}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-white text-sm font-semibold whitespace-nowrap">{order.customer_first_name} {order.customer_last_name}</div>
                        <div className="text-white/40 text-xs">{order.customer_email}</div>
                      </td>
                      <td className="px-5 py-4 text-white/60 text-sm whitespace-nowrap">{order.shipping_city}, {order.shipping_country}</td>
                      <td className="px-5 py-4">
                        <span className="text-white/50 text-xs capitalize">{order.delivery_method.replace("_", " ")}</span>
                      </td>
                      <td className="px-5 py-4 text-white font-bold text-sm whitespace-nowrap">{formatPrice(order.total)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/40 text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#FF9D3D] hover:text-[#FFB366] font-semibold whitespace-nowrap">
                          Détail <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
