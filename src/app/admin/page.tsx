"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Package, TrendingUp, Clock, CheckCircle, Truck, AlertCircle, ArrowRight, BarChart2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import SalesChart from "@/components/admin/SalesChart";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

interface BestSeller {
  product_id: string;
  product_name: string;
  total_sold: number;
  total_revenue: number;
  image: string | null;
}

interface DayData {
  date: string;
  revenue: number;
  orders: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "En attente",   color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",  icon: Clock },
  confirmed: { label: "Confirmée",    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",        icon: CheckCircle },
  shipped:   { label: "Expédiée",     color: "text-purple-400 bg-purple-400/10 border-purple-400/20",  icon: Truck },
  delivered: { label: "Livrée",       color: "text-green-400 bg-green-400/10 border-green-400/20",     icon: CheckCircle },
  cancelled: { label: "Annulée",      color: "text-red-400 bg-red-400/10 border-red-400/20",           icon: AlertCircle },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [chartMode, setChartMode] = useState<"revenue" | "orders">("revenue");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sb = getSupabase();

      const [ordersRes, productsRes, recentRes, itemsRes] = await Promise.all([
        sb.from("orders").select("total, status, created_at"),
        sb.from("products").select("id, images", { count: "exact" }),
        sb.from("orders")
          .select("id, order_number, customer_first_name, customer_last_name, customer_email, total, status, created_at")
          .order("created_at", { ascending: false }).limit(8),
        sb.from("order_items").select("product_id, product_name, quantity, subtotal"),
      ]);

      const orders = ordersRes.data ?? [];
      const activeOrders = orders.filter(o => o.status !== "cancelled");

      // Stats
      setStats({
        totalRevenue: activeOrders.reduce((s, o) => s + Number(o.total), 0),
        totalOrders: orders.length,
        totalProducts: productsRes.count ?? 0,
        pendingOrders: orders.filter(o => o.status === "pending").length,
      });

      setRecentOrders(recentRes.data ?? []);

      // Chart: 30 derniers jours
      const days: Record<string, DayData> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
        days[d.toISOString().slice(0, 10)] = { date: key, revenue: 0, orders: 0 };
      }
      activeOrders.forEach(o => {
        const key = new Date(o.created_at).toISOString().slice(0, 10);
        if (days[key]) {
          days[key].revenue += Number(o.total);
          days[key].orders += 1;
        }
      });
      setChartData(Object.values(days));

      // Best sellers
      const items = itemsRes.data ?? [];
      const map: Record<string, BestSeller> = {};
      items.forEach(item => {
        if (!map[item.product_id]) {
          map[item.product_id] = {
            product_id: item.product_id,
            product_name: item.product_name,
            total_sold: 0,
            total_revenue: 0,
            image: null,
          };
        }
        map[item.product_id].total_sold += item.quantity;
        map[item.product_id].total_revenue += Number(item.subtotal);
      });
      // Attach images
      const productImgs = productsRes.data ?? [];
      Object.values(map).forEach(bs => {
        const p = productImgs.find((px: { id: string; images: string[] | null }) => px.id === bs.product_id);
        if (p?.images?.[0]) bs.image = p.images[0];
      });
      setBestSellers(Object.values(map).sort((a, b) => b.total_sold - a.total_sold).slice(0, 5));

      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-condensed font-black uppercase text-white text-3xl">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Bienvenue dans l&apos;administration iDoh ELITE</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Chiffre d'affaires",  value: formatPrice(stats?.totalRevenue ?? 0), icon: TrendingUp,   color: "text-[#FF9D3D]", bg: "bg-[#FF9D3D]/10" },
          { label: "Commandes totales",   value: String(stats?.totalOrders ?? 0),        icon: ShoppingBag,  color: "text-blue-400",   bg: "bg-blue-400/10" },
          { label: "Produits en ligne",   value: String(stats?.totalProducts ?? 0),      icon: Package,      color: "text-green-400",  bg: "bg-green-400/10" },
          { label: "En attente",          value: String(stats?.pendingOrders ?? 0),       icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-400/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#141414] border border-white/8 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`font-condensed font-black text-2xl ${color}`}>{value}</div>
            <div className="text-white/40 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#FF9D3D]" />
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">
              {chartMode === "revenue" ? "Chiffre d'affaires" : "Commandes"} — 30 derniers jours
            </h2>
          </div>
          <div className="flex gap-1">
            {(["revenue", "orders"] as const).map(m => (
              <button key={m} onClick={() => setChartMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  chartMode === m ? "bg-[#FF9D3D] text-white" : "text-white/30 hover:text-white"
                }`}>
                {m === "revenue" ? "CA" : "Commandes"}
              </button>
            ))}
          </div>
        </div>
        <SalesChart data={chartData} mode={chartMode} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Best sellers */}
        <div className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">🏆 Meilleures ventes</h2>
          </div>
          {bestSellers.length === 0 ? (
            <div className="text-center py-12 text-white/20 text-sm">Pas encore de ventes</div>
          ) : (
            <div className="divide-y divide-white/5">
              {bestSellers.map((bs, i) => (
                <div key={bs.product_id} className="flex items-center gap-4 px-6 py-3">
                  <span className={`w-6 text-center font-black text-sm ${i === 0 ? "text-[#FF9D3D]" : i === 1 ? "text-white/60" : "text-white/30"}`}>
                    #{i + 1}
                  </span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1e1e1e] flex-shrink-0">
                    {bs.image ? (
                      <Image src={bs.image} alt={bs.product_name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">?</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{bs.product_name}</p>
                    <p className="text-white/30 text-xs">{bs.total_sold} vendu{bs.total_sold > 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-[#FF9D3D] font-bold text-sm flex-shrink-0">{formatPrice(bs.total_revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Dernières commandes</h2>
            <Link href="/admin/orders" className="text-[#FF9D3D] text-xs font-semibold hover:text-[#FFB366] flex items-center gap-1">
              Tout voir <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-white/20 text-sm">Aucune commande</div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentOrders.slice(0, 5).map(order => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <Link key={order.id} href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-white/3 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#FF9D3D] font-bold text-xs">{order.order_number}</p>
                      <p className="text-white text-sm truncate">{order.customer_first_name} {order.customer_last_name}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${cfg.color}`}>
                      <StatusIcon className="w-2.5 h-2.5" /> {cfg.label}
                    </span>
                    <span className="text-white font-bold text-sm flex-shrink-0">{formatPrice(order.total)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
