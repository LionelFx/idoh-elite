"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Truck, AlertCircle, ExternalLink } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { getTrackingUrl } from "@/lib/tracking";
import { getColorName } from "@/lib/colors";

const CANCEL_REASONS = [
  "J'ai changé d'avis",
  "Erreur dans ma commande (taille, couleur, produit...)",
  "J'ai trouvé moins cher ailleurs",
  "Le délai de livraison est trop long",
  "Autre raison",
];

const STATUS_CONFIG = {
  pending:   { label: "En attente", color: "text-yellow-600 bg-yellow-100 border-yellow-200", icon: Clock },
  confirmed: { label: "Confirmée",  color: "text-blue-600 bg-blue-100 border-blue-200",      icon: CheckCircle },
  shipped:   { label: "Expédiée",   color: "text-purple-600 bg-purple-100 border-purple-200", icon: Truck },
  delivered: { label: "Livrée",     color: "text-green-600 bg-green-100 border-green-200",   icon: CheckCircle },
  cancelled: { label: "Annulée",    color: "text-red-600 bg-red-100 border-red-200",         icon: AlertCircle },
} as const;

interface OrderDetail {
  id: string;
  order_number: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
  delivery_method: string;
  subtotal: number;
  delivery_cost: number;
  promo_code: string | null;
  promo_discount: number | null;
  total: number;
  status: string;
  tracking_number: string | null;
  created_at: string;
  user_id: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  size: string;
  color: string;
  quantity: number;
  subtotal: number;
}

export default function CommandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace(`/compte?redirect=/compte/commandes/${id}`); return; }

    const sb = getSupabase();
    Promise.all([
      sb.from("orders").select("*").eq("id", id).eq("user_id", user.id).single(),
      sb.from("order_items").select("*").eq("order_id", id),
    ]).then(([orderRes, itemsRes]) => {
      if (!orderRes.data) { setNotFound(true); setLoading(false); return; }
      setOrder(orderRes.data);
      setItems(itemsRes.data ?? []);
      setLoading(false);
    });
  }, [id, user, authLoading, router]);

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-[#999] font-semibold">Commande introuvable.</p>
      <Link href="/compte/commandes" className="text-[#FF9D3D] font-bold text-sm hover:underline">← Mes commandes</Link>
    </div>
  );

  if (!order) return null;

  const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const canCancel = order.status === "pending" || order.status === "confirmed";

  const handleCancel = async () => {
    if (!user || !cancelReason.trim()) return;
    setCancelling(true);
    const res = await fetch("/api/orders/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, userId: user.id, reason: cancelReason }),
    });
    const json = await res.json();
    setCancelling(false);
    if (json.ok) {
      setOrder(prev => prev ? { ...prev, status: "cancelled" } : prev);
      setShowCancelForm(false);
    } else {
      alert(json.error ?? "Une erreur est survenue lors de l'annulation.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="bg-[#1a1a1a] pt-[100px] lg:pt-[116px] pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link href="/compte/commandes" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mes commandes
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[#FF9D3D] text-xs font-bold uppercase tracking-widest mb-1">{order.order_number}</p>
              <h1 className="font-condensed font-black uppercase text-white" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                Détail de la commande
              </h1>
              <p className="text-white/40 text-sm mt-1">
                {new Date(order.created_at).toLocaleDateString("fr-FR", { dateStyle: "full" })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.color}`}>
              <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Gauche : articles */}
          <div className="lg:col-span-2 space-y-6">

            {/* Articles */}
            <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#f0f0f0] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#FF9D3D]" />
                <h2 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wider">Articles commandés</h2>
              </div>
              <div className="divide-y divide-[#f5f5f5]">
                {items.map(item => (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span
                        className="w-5 h-5 rounded-full border border-[#e0e0e0] flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: item.color }}
                        title={getColorName(item.color)}
                      />
                      <div>
                        <p className="font-semibold text-[#1a1a1a] text-sm">{item.product_name}</p>
                        <p className="text-[#999] text-xs mt-0.5">{getColorName(item.color)} · Taille {item.size} · Qté {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#1a1a1a] text-sm">{formatPrice(item.subtotal)}</p>
                      <p className="text-[#bbb] text-xs">{formatPrice(item.product_price)} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-[#f0f0f0] space-y-2 bg-[#fafafa]">
                <div className="flex justify-between text-sm">
                  <span className="text-[#999]">Sous-total</span>
                  <span className="font-semibold text-[#1a1a1a]">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#999]">Livraison</span>
                  <span className="font-semibold text-[#1a1a1a]">{order.delivery_cost === 0 ? "Gratuite" : formatPrice(order.delivery_cost)}</span>
                </div>
                {order.promo_code && order.promo_discount != null && order.promo_discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#FF9D3D] font-semibold flex items-center gap-1.5">
                      <span className="text-xs bg-[#FF9D3D]/10 border border-[#FF9D3D]/30 px-2 py-0.5 rounded font-mono tracking-wider">{order.promo_code}</span>
                    </span>
                    <span className="font-bold text-[#FF9D3D]">-{formatPrice(order.promo_discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-[#e0e0e0] pt-2 mt-1">
                  <span className="text-[#1a1a1a]">Total payé</span>
                  <span className="text-[#FF9D3D] text-lg">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Numéro de suivi */}
            {order.tracking_number && (
              <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-[#FF9D3D]" />
                  <h2 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wider">Suivi du colis</h2>
                </div>
                <p className="font-mono text-[#1a1a1a] font-bold text-lg mb-3">{order.tracking_number}</p>
                {(() => {
                  const trackingUrl = getTrackingUrl(order.delivery_method, order.tracking_number, order.shipping_zip);
                  return trackingUrl ? (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF9D3D] hover:bg-[#FFB366] text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      Suivre mon colis <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <p className="text-[#999] text-xs">
                      Utilise ce numéro sur le site de ton transporteur pour suivre ton colis.
                    </p>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Droite : livraison */}
          <div>
            <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[#FF9D3D]" />
                <h2 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wider">Livraison</h2>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-[#1a1a1a] font-semibold">{order.shipping_address}</p>
                <p className="text-[#999]">{order.shipping_zip} {order.shipping_city}</p>
                <p className="text-[#999]">{order.shipping_country}</p>
                <p className="text-[#FF9D3D] font-semibold mt-3 capitalize">{order.delivery_method.replace(/_/g, " ")}</p>
              </div>
            </div>

            {canCancel && (
              <div className="bg-white rounded-xl border border-[#e0e0e0] p-6 mt-6">
                {!showCancelForm ? (
                  <>
                    <button
                      onClick={() => setShowCancelForm(true)}
                      className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider text-sm py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      Annuler ma commande
                    </button>
                    <p className="text-[#999] text-xs mt-2 text-center">Remboursement intégral, sous quelques jours.</p>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="font-bold text-[#1a1a1a] text-sm">Pourquoi veux-tu annuler ?</p>
                    <select
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      className="w-full px-4 py-3 rounded border border-[#e0e0e0] text-sm outline-none focus:border-[#FF9D3D] bg-[#f5f5f5]"
                    >
                      <option value="">Choisis une raison…</option>
                      {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <p className="text-[#999] text-xs">Remboursement intégral sous quelques jours. Cette action est irréversible.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowCancelForm(false); setCancelReason(""); }}
                        className="flex-1 border border-[#e0e0e0] text-[#1a1a1a] font-bold uppercase tracking-wider text-xs py-2.5 rounded-xl transition-colors cursor-pointer hover:border-[#999]"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling || !cancelReason.trim()}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {cancelling ? "Annulation…" : "Confirmer l'annulation"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
