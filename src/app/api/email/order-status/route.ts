import { NextRequest, NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getTrackingUrl } from "@/lib/tracking";

const CONTENT: Record<string, { subject: string; icon: string; title: string; body: (o: { firstName: string; orderNumber: string; trackingNumber: string | null; deliveryMethod: string }) => string }> = {
  confirmed: {
    subject: "Commande confirmée",
    icon: "✓",
    title: "Commande confirmée",
    body: o => `Ta commande <strong style="color:#FF9D3D;">${o.orderNumber}</strong> est confirmée. On la prépare avec soin — tu seras prévenu dès qu'elle prend la route.`,
  },
  shipped: {
    subject: "Commande expédiée",
    icon: "📦",
    title: "Commande expédiée",
    body: o =>
      `Ta commande <strong style="color:#FF9D3D;">${o.orderNumber}</strong> vient de prendre la route via ${o.deliveryMethod.replace(/_/g, " ")}.` +
      (o.trackingNumber ? ` Numéro de suivi : <strong style="color:#FF9D3D;">${o.trackingNumber}</strong>.` : ""),
  },
  delivered: {
    subject: "Commande livrée",
    icon: "🎉",
    title: "Commande livrée",
    body: o => `Ta commande <strong style="color:#FF9D3D;">${o.orderNumber}</strong> est arrivée. Profite à fond — et si quoi que ce soit ne va pas, réponds simplement à cet email.`,
  },
  cancelled: {
    subject: "Commande annulée",
    icon: "✕",
    title: "Commande annulée",
    body: o => `Ta commande <strong style="color:#FF9D3D;">${o.orderNumber}</strong> a été annulée. Le remboursement intégral a été initié et apparaîtra sur ton compte sous quelques jours (délai bancaire standard). Une question ? Réponds à cet email.`,
  },
};

export async function POST(req: NextRequest) {
  const { orderId, status } = await req.json();
  const content = CONTENT[status];
  if (!orderId || !content) {
    return NextResponse.json({ ok: false, error: "Statut sans notification." }, { status: 400 });
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("order_number, customer_first_name, customer_email, tracking_number, delivery_method, shipping_zip")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ ok: false, error: "Commande introuvable." }, { status: 404 });
  }

  const trackingUrl = status === "shipped" ? getTrackingUrl(order.delivery_method, order.tracking_number, order.shipping_zip) : null;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="only light"><meta name="supported-color-schemes" content="only light"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:36px;">
    <span style="font-size:26px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">
      <span style="color:#FF9D3D;">iDoh</span><span style="color:#fff;"> ELITE</span>
    </span>
  </div>

  <div style="background:#111;border:1px solid #1e1e1e;border-radius:20px;padding:36px 28px;margin-bottom:20px;text-align:center;">
    <div style="width:60px;height:60px;background:#FF9D3D;border-radius:50%;margin:0 auto 18px;line-height:60px;font-size:26px;text-align:center;">${content.icon}</div>
    <h1 style="color:#fff;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px;">${content.title}</h1>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin:0;">${order.order_number}</p>
  </div>

  <div style="background:#111;border-left:3px solid #FF9D3D;border-radius:0 14px 14px 0;padding:18px 22px;margin-bottom:32px;">
    <p style="color:#fff;font-size:15px;line-height:1.75;margin:0;">${content.body({
      firstName: order.customer_first_name,
      orderNumber: order.order_number,
      trackingNumber: order.tracking_number,
      deliveryMethod: order.delivery_method,
    })}</p>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:14px 0 0;">— L'équipe iDoh ELITE</p>
  </div>

  <div style="text-align:center;margin-bottom:32px;">
    ${trackingUrl
      ? `<a href="${trackingUrl}" style="display:inline-block;background:#FF9D3D;color:#fff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;padding:14px 32px;border-radius:12px;text-decoration:none;">Suivre mon colis</a>
         <p style="margin:14px 0 0;"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/compte/commandes" style="color:#666;font-size:12px;text-decoration:underline;">Voir ma commande</a></p>`
      : `<a href="${process.env.NEXT_PUBLIC_SITE_URL}/compte/commandes" style="display:inline-block;background:#FF9D3D;color:#fff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;padding:14px 32px;border-radius:12px;text-decoration:none;">Suivre ma commande</a>`
    }
  </div>

  <div style="text-align:center;border-top:1px solid #1a1a1a;padding-top:24px;">
    <p style="color:#333;font-size:11px;margin:0;">© ${new Date().getFullYear()} iDoh ELITE · Tous droits réservés</p>
    <p style="color:#333;font-size:11px;margin:6px 0 0;">Tu reçois cet email car tu as passé une commande sur iDoh ELITE.</p>
  </div>

</div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"iDoh ELITE" <${process.env.GMAIL_USER}>`,
      to: order.customer_email,
      subject: `${content.icon} ${content.subject} ${order.order_number} — iDoh ELITE`,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Order status email error:", err);
    return NextResponse.json({ ok: false, error: "Erreur d'envoi." }, { status: 500 });
  }
}
