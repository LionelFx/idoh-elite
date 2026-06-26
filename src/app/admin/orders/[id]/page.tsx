"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, Truck, AlertCircle, Package, Milestone, ExternalLink } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { getTrackingUrl } from "@/lib/tracking";
import { getColorName } from "@/lib/colors";

interface OrderDetail {
  id: string;
  order_number: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
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
  cancel_reason: string | null;
  notes: string;
  created_at: string;
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

const STATUSES = [
  { value: "pending",   label: "En attente",  icon: Clock,        color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  { value: "confirmed", label: "Confirmée",   icon: CheckCircle,  color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { value: "shipped",   label: "Expédiée",    icon: Truck,        color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { value: "delivered", label: "Livrée",      icon: CheckCircle,  color: "text-green-400 bg-green-400/10 border-green-400/20" },
  { value: "cancelled", label: "Annulée",     icon: AlertCircle,  color: "text-red-400 bg-red-400/10 border-red-400/20" },
];

// Ces statuts déclenchent un email immédiat et irréversible au client — on confirme avant.
const NOTIFIES_CUSTOMER = ["confirmed", "shipped", "delivered", "cancelled"];

// Progression à sens unique uniquement — chaque étape envoie un email, donc revenir en
// arrière enverrait un email contradictoire/trompeur au client. "Livrée" et "Annulée" sont
// terminales : plus aucun changement possible une fois atteintes.
const SEQUENCE = ["pending", "confirmed", "shipped", "delivered"];

function canTransitionTo(current: string, target: string) {
  if (current === "delivered" || current === "cancelled") return false;
  // Annulation possible seulement avant expédition — le colis a déjà quitté l'entrepôt
  // une fois "shipped", ça relèverait d'un retour, pas d'une annulation.
  if (target === "cancelled") return current === "pending" || current === "confirmed";
  return SEQUENCE.indexOf(target) > SEQUENCE.indexOf(current);
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingSaved, setTrackingSaved] = useState(false);
  const [statusEmailSent, setStatusEmailSent] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    Promise.all([
      sb.from("orders").select("*").eq("id", id).single(),
      sb.from("order_items").select("*").eq("order_id", id),
    ]).then(([orderRes, itemsRes]) => {
      setOrder(orderRes.data);
      setTrackingInput(orderRes.data?.tracking_number ?? "");
      setItems(itemsRes.data ?? []);
    });
  }, [id]);

  const updateStatus = async (status: string) => {
    if (status === "shipped" && !order?.tracking_number) {
      alert('Ajoute et enregistre le numéro de suivi avant de passer la commande en "Expédiée" — sinon le client ne pourra pas suivre son colis.');
      return;
    }
    if (NOTIFIES_CUSTOMER.includes(status)) {
      const label = STATUSES.find(s => s.value === status)?.label ?? status;
      const suffix = status === "cancelled" ? " Le client sera intégralement remboursé." : "";
      if (!confirm(`Passer cette commande en "${label}" ? Un email sera envoyé immédiatement au client — cette action est irréversible.${suffix}`)) return;
    }

    // Annulation : passe par /api/orders/cancel pour rembourser réellement sur Stripe et
    // remettre le stock — pas juste changer le statut et envoyer un email qui promet
    // un remboursement sans jamais le déclencher.
    if (status === "cancelled") {
      setSaving(true);
      try {
        const res = await fetch("/api/orders/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id, isAdmin: true }),
        });
        const json = await res.json();
        if (json.ok) {
          setOrder(prev => prev ? { ...prev, status: "cancelled" } : prev);
          setStatusEmailSent(true);
          setTimeout(() => setStatusEmailSent(false), 2500);
        } else {
          alert(json.error ?? "Erreur lors de l'annulation.");
        }
      } catch {
        alert("Erreur lors de l'annulation.");
      }
      setSaving(false);
      return;
    }

    setSaving(true);
    await getSupabase().from("orders").update({ status }).eq("id", id);
    setOrder(prev => prev ? { ...prev, status } : prev);
    setSaving(false);

    try {
      const res = await fetch("/api/email/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, status }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatusEmailSent(true);
        setTimeout(() => setStatusEmailSent(false), 2500);
      }
    } catch { /* le statut est déjà sauvegardé, l'email n'est pas bloquant */ }
  };

  const saveTracking = async () => {
    setSaving(true);
    await getSupabase().from("orders").update({ tracking_number: trackingInput || null }).eq("id", id);
    setOrder(prev => prev ? { ...prev, tracking_number: trackingInput || null } : prev);
    setTrackingSaved(true);
    setSaving(false);
    setTimeout(() => setTrackingSaved(false), 2500);
  };

  if (!order) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-[#FF9D3D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const currentStatus = STATUSES.find(s => s.value === order.status) ?? STATUSES[0];
  const CurrentIcon = currentStatus.icon;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-condensed font-black uppercase text-white text-3xl">{order.order_number}</h1>
          <p className="text-white/40 text-sm">{new Date(order.created_at).toLocaleDateString("fr-FR", { dateStyle: "full" })}</p>
        </div>
        <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${currentStatus.color}`}>
          <CurrentIcon className="w-3.5 h-3.5" /> {currentStatus.label}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gauche : articles + statut + suivi */}
        <div className="lg:col-span-2 space-y-6">

          {/* Articles commandés */}
          <div className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/8 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FF9D3D]" />
              <h2 className="font-bold text-white text-sm uppercase tracking-wider">Articles commandés</h2>
            </div>
            <div className="divide-y divide-white/5">
              {items.map(item => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: item.color }}
                      title={getColorName(item.color)}
                    />
                    <div>
                      <p className="text-white font-semibold text-sm">{item.product_name}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {getColorName(item.color)} · Taille {item.size} · Qté {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{formatPrice(item.subtotal)}</p>
                    <p className="text-white/30 text-xs">{formatPrice(item.product_price)} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-white/8 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Sous-total</span>
                <span className="text-white">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Livraison</span>
                <span className="text-white">{order.delivery_cost === 0 ? "Gratuite" : formatPrice(order.delivery_cost)}</span>
              </div>
              {order.promo_code && order.promo_discount != null && order.promo_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#FF9D3D] font-semibold flex items-center gap-1.5">
                    <span className="text-xs bg-[#FF9D3D]/15 border border-[#FF9D3D]/30 px-2 py-0.5 rounded font-mono tracking-wider">{order.promo_code}</span>
                  </span>
                  <span className="font-bold text-[#FF9D3D]">-{formatPrice(order.promo_discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-white/8 pt-2">
                <span className="text-white">Total payé</span>
                <span className="text-[#FF9D3D]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Changer le statut */}
          <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
            <h2 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Changer le statut</h2>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(({ value, label, icon: Icon, color }) => {
                const isCurrent = order.status === value;
                const locked = !isCurrent && !canTransitionTo(order.status, value);
                const needsTracking = value === "shipped" && !isCurrent && !locked && !order.tracking_number;
                return (
                  <button key={value} onClick={() => updateStatus(value)} disabled={saving || isCurrent || locked}
                    title={
                      locked && value === "cancelled" ? "Colis déjà expédié — plus possible d'annuler, seulement un retour"
                      : locked ? "Retour en arrière impossible — évite d'envoyer un email contradictoire au client"
                      : needsTracking ? "Numéro de suivi requis avant de passer en expédiée"
                      : undefined
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all disabled:cursor-default ${
                      isCurrent
                        ? `${color} scale-105`
                        : locked
                        ? "border-white/5 text-white/15 opacity-50"
                        : needsTracking
                        ? "border-amber-400/25 text-amber-400/70 hover:border-amber-400/50 hover:text-amber-400 cursor-pointer"
                        : "border-white/10 text-white/40 hover:border-white/30 hover:text-white cursor-pointer"
                    }`}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                );
              })}
            </div>
            {(order.status === "delivered" || order.status === "cancelled") && (
              <p className="text-white/20 text-xs mt-3">Statut final — plus aucun changement possible.</p>
            )}
            {order.status === "cancelled" && order.cancel_reason && (
              <p className="text-red-400/70 text-xs mt-2 bg-red-400/5 border border-red-400/20 rounded-lg px-3 py-2">
                Raison donnée par le client : <span className="text-red-400 font-semibold">{order.cancel_reason}</span>
              </p>
            )}
            {saving && <p className="text-white/30 text-xs mt-2">Sauvegarde…</p>}
            {statusEmailSent && <p className="text-green-400 text-xs mt-2">✓ Client notifié par email</p>}
          </div>

          {/* Numéro de suivi */}
          <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Milestone className="w-4 h-4 text-[#FF9D3D]" />
              <h2 className="font-bold text-white text-sm uppercase tracking-wider">Numéro de suivi</h2>
            </div>
            <div className="flex gap-2">
              <input
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                placeholder="Ex: 6A12345678901"
                className="flex-1 bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-mono outline-none focus:border-[#FF9D3D] placeholder-white/20"
              />
              <button
                onClick={saveTracking}
                disabled={saving}
                className="px-4 py-2.5 bg-[#FF9D3D] hover:bg-[#FFB366] text-white text-sm font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {trackingSaved ? "✓ Sauvegardé" : "Enregistrer"}
              </button>
            </div>
            {order.tracking_number && (() => {
              const trackingUrl = getTrackingUrl(order.delivery_method, order.tracking_number, order.shipping_zip);
              return (
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-white/40 text-xs">
                    Suivi actuel : <span className="font-mono text-white/60">{order.tracking_number}</span>
                  </p>
                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#FF9D3D] hover:text-[#FFB366] text-xs font-bold transition-colors"
                    >
                      Tester le lien <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Droite : client + livraison */}
        <div className="space-y-6">
          <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
            <h2 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Client</h2>
            <div className="space-y-2 text-sm">
              <p className="text-white font-semibold">{order.customer_first_name} {order.customer_last_name}</p>
              <p className="text-white/50">{order.customer_email}</p>
              {order.customer_phone && <p className="text-white/50">{order.customer_phone}</p>}
            </div>
          </div>

          <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
            <h2 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Livraison</h2>
            <div className="space-y-1 text-sm">
              <p className="text-white">{order.shipping_address}</p>
              <p className="text-white/60">{order.shipping_zip} {order.shipping_city}</p>
              <p className="text-white/60">{order.shipping_country}</p>
              <p className="text-[#FF9D3D] font-semibold mt-3 capitalize">{order.delivery_method.replace(/_/g, " ")}</p>
            </div>
          </div>

          {order.notes && (
            <div className="bg-[#141414] border border-white/8 rounded-2xl p-6">
              <h2 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Notes</h2>
              <p className="text-white/50 text-sm">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
