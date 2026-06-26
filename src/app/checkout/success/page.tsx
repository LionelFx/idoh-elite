"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Eye, EyeOff } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { DELIVERY_LABELS, type DeliveryKey } from "@/lib/delivery";
import { getColorName } from "@/lib/colors";

interface OrderItem {
  id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  user_id: string | null;
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
  paid_at: string | null;
}

const MAX_ATTEMPTS = 6;

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [attempts, setAttempts] = useState(0);

  const [accountPassword, setAccountPassword] = useState("");
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [accountCreating, setAccountCreating] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const poll = async () => {
      const res = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`);
      const json = await res.json();
      if (cancelled) return;

      if (!json.ok) {
        setAttempts(a => a + 1);
        return;
      }

      setOrder(json.order);
      setItems(json.items);

      if (!json.order.paid_at) {
        setAttempts(a => a + 1);
      } else if (!clearedRef.current) {
        clearedRef.current = true;
        clearCart();
      }
    };

    poll();
    const id = setInterval(poll, 1500);
    return () => { cancelled = true; clearInterval(id); };
  }, [sessionId, clearCart]);

  const timedOut = attempts >= MAX_ATTEMPTS;
  const notFound = !sessionId || (timedOut && !order);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[#1a1a1a] font-semibold">Commande introuvable.</p>
        <p className="text-[#999] text-sm max-w-sm">Si tu viens de payer, vérifie tes emails — la confirmation peut arriver avec un léger délai.</p>
        <Link href="/products" className="text-[#FF9D3D] font-bold text-sm hover:underline">← Retour au catalogue</Link>
      </div>
    );
  }

  if (!order || !order.paid_at) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Loader2 className="w-8 h-8 text-[#FF9D3D] animate-spin" />
        <p className="text-[#1a1a1a] font-semibold">Confirmation du paiement en cours…</p>
        <p className="text-[#999] text-sm">Ça ne devrait prendre que quelques secondes.</p>
      </div>
    );
  }

  const deliveryLabel = DELIVERY_LABELS[order.delivery_method as DeliveryKey] ?? order.delivery_method.replace(/_/g, " ");
  const hasAccount = !!order.user_id || accountCreated;

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountPassword.length < 6) { setAccountError("Mot de passe trop court (min. 6 caractères)."); return; }
    setAccountCreating(true);
    setAccountError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: order.customer_email,
        password: accountPassword,
        firstName: order.customer_first_name,
        lastName: order.customer_last_name,
        orderId: order.id,
      }),
    });
    const json = await res.json();
    setAccountCreating(false);
    if (!json.ok) { setAccountError(json.error ?? "Une erreur est survenue."); return; }
    setAccountCreated(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-[120px] lg:pt-[136px] pb-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/20">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <h1 className="font-condensed font-black uppercase text-[#1a1a1a] mb-2" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>
            Commande passée !
          </h1>
          <div className="inline-flex items-center gap-2 bg-[#FF9D3D]/10 border border-[#FF9D3D]/30 rounded-full px-4 py-1.5 mb-3">
            <span className="text-[#FF9D3D] font-black font-mono tracking-widest text-sm">{order.order_number}</span>
          </div>
          <p className="text-[#999] text-sm">
            Merci <strong className="text-[#1a1a1a]">{order.customer_first_name}</strong> ! Un email de confirmation a été envoyé à{" "}
            <strong className="text-[#1a1a1a]">{order.customer_email}</strong>.
          </p>
        </div>

        <div className="grid sm:grid-cols-5 gap-5">
          <div className="sm:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0f0f0]">
                <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-lg">Articles commandés</h2>
              </div>
              <div className="divide-y divide-[#f5f5f5]">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1a1a1a] text-sm truncate">{item.product_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-3 h-3 rounded-full border border-[#e0e0e0] flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[#999] text-xs">{getColorName(item.color)} · Taille {item.size} · Qté {item.quantity}</span>
                      </div>
                    </div>
                    <p className="font-bold text-[#1a1a1a] text-sm flex-shrink-0">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-[#fafafa] border-t border-[#f0f0f0] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#999]">Sous-total</span>
                  <span className="font-medium text-[#1a1a1a]">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#999]">Livraison ({deliveryLabel})</span>
                  <span className={`font-medium ${order.delivery_cost === 0 ? "text-green-600" : "text-[#1a1a1a]"}`}>
                    {order.delivery_cost === 0 ? "Gratuite" : formatPrice(order.delivery_cost)}
                  </span>
                </div>
                {order.promo_code && order.promo_discount && order.promo_discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#FF9D3D] font-semibold flex items-center gap-1.5">
                      <span className="text-xs bg-[#FF9D3D]/10 border border-[#FF9D3D]/30 px-2 py-0.5 rounded font-mono">{order.promo_code}</span>
                    </span>
                    <span className="font-bold text-[#FF9D3D]">-{formatPrice(order.promo_discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black border-t border-[#e0e0e0] pt-2 mt-1">
                  <span className="font-condensed uppercase text-[#1a1a1a] tracking-wide">Total payé</span>
                  <span className="text-[#FF9D3D] text-xl">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-[#e0e0e0] p-5">
              <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-base mb-3">Livraison</h2>
              <p className="text-[#FF9D3D] font-bold text-sm mb-3">{deliveryLabel}</p>
              <div className="text-sm text-[#555] space-y-0.5">
                <p>{order.shipping_address}</p>
                <p>{order.shipping_zip} {order.shipping_city}</p>
                <p>{order.shipping_country}</p>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-5 space-y-2.5">
              <p className="text-white/50 text-xs">📦 Expédition sous 24h ouvrées</p>
              <p className="text-white/50 text-xs">📧 Email de confirmation envoyé à <span className="text-white/70">{order.customer_email}</span></p>
              <p className="text-white/50 text-xs">↩️ Retours acceptés sous 30 jours</p>
              <p className="text-yellow-400/70 text-xs border-t border-white/10 pt-2.5 mt-1">
                Tu ne vois pas l&apos;email ? Vérifie ton dossier <strong className="text-yellow-400">spam</strong> ou courrier indésirable.
              </p>
            </div>

            {!hasAccount && (
              accountCreated ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-1.5">
                  <p className="text-green-700 font-semibold text-sm">Compte créé !</p>
                  <p className="text-green-700/70 text-xs">Vérifie ton email pour confirmer ton inscription, puis connecte-toi pour suivre cette commande.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateAccount} className="bg-white rounded-xl border border-[#e0e0e0] p-5 space-y-3">
                  <h2 className="font-condensed font-black uppercase text-[#1a1a1a] text-base">Créer mon compte</h2>
                  <p className="text-[#999] text-xs">Pour suivre cette commande et les prochaines, en 10 secondes — {order.customer_email}</p>
                  <div className="relative">
                    <input
                      type={showAccountPassword ? "text" : "password"}
                      required
                      value={accountPassword}
                      onChange={e => { setAccountPassword(e.target.value); setAccountError(""); }}
                      placeholder="Choisis un mot de passe"
                      className="w-full px-4 py-3 pr-11 rounded border border-[#e0e0e0] text-sm outline-none focus:border-[#FF9D3D] bg-[#f5f5f5]"
                    />
                    <button type="button" onClick={() => setShowAccountPassword(!showAccountPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#1a1a1a] cursor-pointer">
                      {showAccountPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {accountError && <p className="text-red-500 text-xs">{accountError}</p>}
                  <button type="submit" disabled={accountCreating}
                    className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#333] disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs py-3 rounded-xl transition-colors cursor-pointer">
                    {accountCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Créer mon compte
                  </button>
                </form>
              )
            )}

            {hasAccount && (
              <Link href={`/compte/commandes/${order.id}`}
                className="flex items-center justify-center gap-2 w-full bg-[#FF9D3D] hover:bg-[#FFB366] text-white font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl transition-colors">
                Suivre ma commande
              </Link>
            )}
            <Link href="/products"
              className="flex items-center justify-center w-full border border-[#e0e0e0] hover:border-[#1a1a1a] text-[#1a1a1a] font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl transition-colors">
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF9D3D] animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
