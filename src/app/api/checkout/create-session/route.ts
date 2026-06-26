import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";
import { getDeliveryCost, isValidDeliveryKey, DELIVERY_LABELS } from "@/lib/delivery";
import { getDiscountedPrice, getVariantStock } from "@/lib/utils";

interface ItemInput {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

interface CustomerInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: string;
  address2?: string;
  city: string;
  zip: string;
  country: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const customer: CustomerInput = body.customer;
  const items: ItemInput[] = body.items;
  const delivery: string = body.delivery;
  const promoCodeInput: string | null = body.promoCode || null;
  const userId: string | null = body.userId || null;

  if (!customer?.email || !customer?.firstName || !customer?.address || !customer?.city || !customer?.zip) {
    return NextResponse.json({ ok: false, error: "Informations client incomplètes." }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "Panier vide." }, { status: 400 });
  }
  if (!isValidDeliveryKey(delivery)) {
    return NextResponse.json({ ok: false, error: "Mode de livraison invalide." }, { status: 400 });
  }

  // Recalcule tout côté serveur — ne fait jamais confiance aux prix/montants envoyés par le client.
  const orderItemsPayload: {
    product_id: string;
    product_name: string;
    product_price: number;
    size: string;
    color: string;
    quantity: number;
    subtotal: number;
  }[] = [];
  const stripeLineItems: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", item.productId)
      .single();

    if (error || !product) {
      return NextResponse.json({ ok: false, error: `Produit introuvable (${item.productId}).` }, { status: 400 });
    }

    const available = getVariantStock(product, item.size, item.color);
    if (item.quantity > available) {
      return NextResponse.json({ ok: false, error: `Stock insuffisant pour ${product.name} (taille ${item.size}).` }, { status: 400 });
    }

    const unitPrice = getDiscountedPrice(product.price, product.discount_percent ?? 0);
    const lineSubtotal = Math.round(unitPrice * item.quantity * 100) / 100;
    subtotal += lineSubtotal;

    orderItemsPayload.push({
      product_id: product.id,
      product_name: product.name,
      product_price: unitPrice,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      subtotal: lineSubtotal,
    });

    stripeLineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: `${product.name} — Taille ${item.size}` },
        unit_amount: Math.round(unitPrice * 100),
      },
      quantity: item.quantity,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const deliveryCost = getDeliveryCost(delivery, subtotal);

  // Code promo — revalidé serveur, jamais déduit d'un montant fourni par le client.
  let promoDiscount = 0;
  let promo: { id: string; code: string; discount_type: "percent" | "fixed"; discount_value: number; uses_count: number } | null = null;
  if (promoCodeInput) {
    const { data: promoData } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("code", promoCodeInput.toUpperCase().trim())
      .eq("active", true)
      .single();

    if (promoData) {
      const expired = promoData.expires_at && new Date(promoData.expires_at) < new Date();
      const exhausted = promoData.max_uses !== null && promoData.uses_count >= promoData.max_uses;
      const belowMin = promoData.min_order && subtotal < promoData.min_order;
      if (!expired && !exhausted && !belowMin) {
        promo = promoData;
        promoDiscount = promoData.discount_type === "percent"
          ? Math.round(subtotal * promoData.discount_value) / 100
          : Math.min(promoData.discount_value, subtotal);
      }
    }
  }

  const total = Math.max(0, Math.round((subtotal + deliveryCost - promoDiscount) * 100) / 100);

  if (deliveryCost > 0) {
    stripeLineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: `Livraison — ${DELIVERY_LABELS[delivery]}` },
        unit_amount: Math.round(deliveryCost * 100),
      },
      quantity: 1,
    });
  }

  // Crée la commande en "pending" non payée — le stock n'est décrémenté et l'email envoyé
  // qu'à la confirmation réelle du paiement (webhook), jamais avant.
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_email: customer.email,
      customer_first_name: customer.firstName,
      customer_last_name: customer.lastName,
      customer_phone: customer.phone || null,
      shipping_address: customer.address2 ? `${customer.address}, ${customer.address2}` : customer.address,
      shipping_city: customer.city,
      shipping_zip: customer.zip,
      shipping_country: customer.country,
      delivery_method: delivery,
      subtotal,
      delivery_cost: deliveryCost,
      promo_code: promo?.code ?? null,
      promo_discount: promoDiscount > 0 ? promoDiscount : null,
      total,
      status: "pending",
      paid_at: null,
      user_id: userId,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ ok: false, error: "Impossible de créer la commande." }, { status: 500 });
  }

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItemsPayload.map(i => ({ ...i, order_id: order.id })));

  if (itemsError) {
    return NextResponse.json({ ok: false, error: "Impossible d'enregistrer les articles." }, { status: 500 });
  }

  let discounts: import("stripe").Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (promoDiscount > 0 && promo) {
    const coupon = await getStripe().coupons.create({
      amount_off: Math.round(promoDiscount * 100),
      currency: "eur",
      duration: "once",
      name: promo.code,
    });
    discounts = [{ coupon: coupon.id }];
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: stripeLineItems,
      discounts,
      customer_email: customer.email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      metadata: { order_id: order.id },
    });

    await supabaseAdmin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    await supabaseAdmin.from("order_items").delete().eq("order_id", order.id);
    return NextResponse.json({ ok: false, error: "Erreur lors de la création du paiement." }, { status: 500 });
  }
}
