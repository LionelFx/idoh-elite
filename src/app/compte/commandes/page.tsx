"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, ChevronRight, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";

const STATUS_CONFIG = {
  pending:   { label: "En attente", color: "text-yellow-600 bg-yellow-100", icon: Clock },
  confirmed: { label: "Confirmée",  color: "text-blue-600 bg-blue-100",    icon: CheckCircle },
  shipped:   { label: "Expédiée",   color: "text-purple-600 bg-purple-100", icon: Truck },
  delivered: { label: "Livrée",     color: "text-green-600 bg-green-100",  icon: CheckCircle },
  cancelled: { label: "Annulée",    color: "text-red-600 bg-red-100",      icon: AlertCircle },
} as const;

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  delivery_method: string;
  shipping_city: string;
}

export default function CommandesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/compte?redirect=/compte/commandes"); return; }
    getSupabase()
      .from("orders")
      .select("id, order_number, total, status, created_at, delivery_method, shipping_city")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, [user, authLoading, router]);

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link href="/compte" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mon compte
          </Link>
          <p className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest mb-2">Mes achats</p>
          <h1 className="font-condensed font-black uppercase text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Mes commandes
          </h1>
          <p className="text-white/40 text-sm mt-2">{orders.length} commande{orders.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-[#e0e0e0] text-center">
            <Package className="w-12 h-12 text-[#ccc] mx-auto mb-4" />
            <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-xl mb-2">Aucune commande</h2>
            <p className="text-[#999] text-sm mb-6">Tu n&apos;as pas encore passé de commande.</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Découvrir la collection <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <Link key={order.id} href={`/compte/commandes/${order.id}`}
                  className="bg-white rounded-xl p-5 border border-[#e0e0e0] hover:border-[#FF9D3D] hover:shadow-md transition-all flex items-center gap-4 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-[#FF9D3D] text-sm">{order.order_number}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-[#999] text-xs mt-1.5">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                      {order.shipping_city ? ` · ${order.shipping_city}` : ""}
                      {" · "}{order.delivery_method.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#1a1a1a]">{formatPrice(order.total)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#ccc] group-hover:text-[#FF9D3D] flex-shrink-0 transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
