import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";

const CANCELLABLE = ["pending", "confirmed"];

// Annulation commande — remboursement Stripe intégral + remise en stock + email.
// Utilisée par le client (compte/commandes/[id], avec vérif. de propriété) ET par l'admin
// (admin/orders/[id], isAdmin: true) pour que les deux chemins remboursent réellement,
// plutôt que d'avoir un email qui promet un remboursement qui n'arrive jamais.
export async function POST(req: NextRequest) {
  const { orderId, userId, isAdmin, reason } = await req.json();
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "Commande manquante." }, { status: 400 });
  }

  const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).single();
  if (!order) {
    return NextResponse.json({ ok: false, error: "Commande introuvable." }, { status: 404 });
  }

  if (!isAdmin && (!userId || order.user_id !== userId)) {
    return NextResponse.json({ ok: false, error: "Cette commande ne t'appartient pas." }, { status: 403 });
  }

  // Raison obligatoire côté client — friction volontaire pour éviter les annulations
  // impulsives en un clic, et donnée business sur le pourquoi. Pas exigée pour l'admin.
  if (!isAdmin && !reason?.trim()) {
    return NextResponse.json({ ok: false, error: "Merci d'indiquer une raison d'annulation." }, { status: 400 });
  }

  if (order.status === "cancelled") {
    return NextResponse.json({ ok: true }); // déjà annulée — idempotent
  }
  if (!CANCELLABLE.includes(order.status)) {
    return NextResponse.json({ ok: false, error: "Cette commande a déjà été expédiée et ne peut plus être annulée en ligne." }, { status: 400 });
  }

  // Remboursement Stripe intégral — seulement si un paiement a réellement eu lieu.
  if (order.paid_at && order.stripe_session_id) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
      const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      if (paymentIntentId) {
        await stripe.refunds.create({ payment_intent: paymentIntentId });
      }
    } catch (err) {
      console.error("Erreur remboursement Stripe:", err);
      return NextResponse.json({ ok: false, error: "Erreur lors du remboursement. Réessaie ou contacte le support." }, { status: 500 });
    }
  }

  // Remise en stock — miroir exact de la décrémentation faite au paiement.
  const { data: orderItems } = await supabaseAdmin.from("order_items").select("*").eq("order_id", orderId);
  const noSizeItems: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpcs: any[] = [];
  for (const item of orderItems ?? []) {
    const { data: product } = await supabaseAdmin.from("products").select("stock_by_variant, stock_by_size").eq("id", item.product_id).single();
    if (product?.stock_by_variant && Object.keys(product.stock_by_variant).length > 0) {
      rpcs.push(supabaseAdmin.rpc("increment_variant_stock", { p_id: item.product_id, p_size: item.size, p_color: item.color, p_qty: item.quantity }));
    } else if (product?.stock_by_size && Object.keys(product.stock_by_size).length > 0) {
      rpcs.push(supabaseAdmin.rpc("increment_size_stock", { p_id: item.product_id, p_size: item.size, p_qty: item.quantity }));
    } else {
      noSizeItems[item.product_id] = (noSizeItems[item.product_id] || 0) + item.quantity;
    }
  }
  Object.entries(noSizeItems).forEach(([productId, qty]) => {
    rpcs.push(supabaseAdmin.rpc("increment_product_stock", { p_id: productId, p_qty: qty }));
  });
  await Promise.all(rpcs);

  await supabaseAdmin.from("orders").update({ status: "cancelled", cancel_reason: reason?.trim() || null }).eq("id", orderId);

  // Email d'annulation (fire & forget, non bloquant)
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/order-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status: "cancelled" }),
  }).catch(err => console.error("Email annulation — erreur:", err));

  return NextResponse.json({ ok: true });
}
