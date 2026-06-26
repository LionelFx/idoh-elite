import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/utils";
import type Stripe from "stripe";

// Stripe vérifie que l'URL est accessible publiquement (probe GET) avant de créer le
// webhook — sans ce handler, Next.js renvoie 404 sur GET et la création échoue.
export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Signature webhook Stripe invalide:", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.error("checkout.session.completed sans order_id en metadata:", session.id);
    return NextResponse.json({ ok: true });
  }

  const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).single();
  if (!order) {
    console.error("Webhook Stripe : commande introuvable", orderId);
    return NextResponse.json({ ok: true });
  }

  // Idempotence — Stripe peut renvoyer le même événement plusieurs fois.
  if (order.paid_at) {
    return NextResponse.json({ ok: true });
  }

  const { data: orderItems } = await supabaseAdmin.from("order_items").select("*").eq("order_id", orderId);

  // Décrémente le stock — seulement maintenant que le paiement est confirmé.
  const noSizeItems: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpcs: any[] = [];
  for (const item of orderItems ?? []) {
    const { data: product } = await supabaseAdmin.from("products").select("stock_by_variant, stock_by_size").eq("id", item.product_id).single();
    if (product?.stock_by_variant && Object.keys(product.stock_by_variant).length > 0) {
      rpcs.push(supabaseAdmin.rpc("decrement_variant_stock", { p_id: item.product_id, p_size: item.size, p_color: item.color, p_qty: item.quantity }));
    } else if (product?.stock_by_size && Object.keys(product.stock_by_size).length > 0) {
      rpcs.push(supabaseAdmin.rpc("decrement_size_stock", { p_id: item.product_id, p_size: item.size, p_qty: item.quantity }));
    } else {
      noSizeItems[item.product_id] = (noSizeItems[item.product_id] || 0) + item.quantity;
    }
  }
  Object.entries(noSizeItems).forEach(([productId, qty]) => {
    rpcs.push(supabaseAdmin.rpc("decrement_product_stock", { p_id: productId, p_qty: qty }));
  });
  await Promise.all(rpcs);

  // Incrémente l'usage du code promo — seulement maintenant, pas à la création de session.
  if (order.promo_code) {
    const { data: promo } = await supabaseAdmin.from("promo_codes").select("id, uses_count").eq("code", order.promo_code).single();
    if (promo) {
      await supabaseAdmin.from("promo_codes").update({ uses_count: promo.uses_count + 1 }).eq("id", promo.id);
    }
  }

  // Paiement confirmé : passe directement en "confirmed" — pas d'email de statut séparé ici,
  // le client reçoit déjà l'email de confirmation de commande juste après (évite le doublon).
  await supabaseAdmin.from("orders").update({ paid_at: new Date().toISOString(), status: "confirmed" }).eq("id", orderId);

  // Email de confirmation — fire & forget, non bloquant pour la réponse au webhook.
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/order-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: order.customer_first_name,
      email: order.customer_email,
      orderNumber: order.order_number,
      items: (orderItems ?? []).map(i => ({
        name: i.product_name,
        size: i.size,
        quantity: i.quantity,
        price: formatPrice(i.subtotal),
      })),
      subtotal: formatPrice(order.subtotal),
      deliveryCost: formatPrice(order.delivery_cost),
      promoCode: order.promo_code,
      promoDiscount: order.promo_discount ? formatPrice(order.promo_discount) : null,
      total: formatPrice(order.total),
      deliveryMethod: order.delivery_method,
    }),
  }).catch(err => console.error("Email confirmation commande — erreur:", err));

  return NextResponse.json({ ok: true });
}
