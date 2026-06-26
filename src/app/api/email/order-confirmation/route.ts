import { NextRequest, NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface OrderEmailItem {
  name: string;
  size: string;
  quantity: number;
  price: string;
}

export async function POST(req: NextRequest) {
  const {
    firstName,
    email,
    orderNumber,
    items,
    subtotal,
    deliveryCost,
    promoCode,
    promoDiscount,
    total,
    deliveryMethod,
  }: {
    firstName: string;
    email: string;
    orderNumber: string;
    items: OrderEmailItem[];
    subtotal: string;
    deliveryCost: string;
    promoCode?: string;
    promoDiscount?: string;
    total: string;
    deliveryMethod: string;
  } = await req.json();

  // Génération du message OpenAI
  let hypeMessage = "Tu fais partie de l'élite. Ta commande est entre les meilleures mains — on s'occupe du reste.";
  try {
    const productList = items.map(i => `${i.name} (x${i.quantity})`).join(", ");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es le copywriter d'iDoh ELITE, une marque de sportswear premium et luxueux. Ton style est percutant, motivant, élitiste, moderne. Tu tutoies toujours. Pas d'emojis. Génère uniquement le message demandé, sans titre ni signature.",
        },
        {
          role: "user",
          content: `Génère un message de confirmation de commande ultra premium pour ${firstName}, qui vient de commander : ${productList}. 2 phrases max. Commence directement par le message. Univers : sport de haut niveau, luxe, streetwear élite, performance.`,
        },
      ],
      max_tokens: 100,
      temperature: 0.85,
    });
    hypeMessage = completion.choices[0]?.message?.content?.trim() ?? hypeMessage;
  } catch {
    // fallback silencieux — le mail part quand même
  }

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #222;">
        <span style="color:#fff;font-weight:600;font-size:14px;">${item.name}</span><br>
        <span style="color:#666;font-size:12px;">Taille ${item.size} · Qté ${item.quantity}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #222;text-align:right;color:#FF9D3D;font-weight:700;font-size:14px;">${item.price}</td>
    </tr>`
    )
    .join("");

  const promoRow = promoCode && promoDiscount
    ? `<tr>
        <td style="padding:6px 0;color:#FF9D3D;font-size:13px;">Code promo <span style="font-family:monospace;background:#1a1a1a;padding:1px 6px;border-radius:4px;">${promoCode}</span></td>
        <td style="padding:6px 0;text-align:right;color:#FF9D3D;font-weight:700;font-size:13px;">-${promoDiscount}</td>
      </tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="only light"><meta name="supported-color-schemes" content="only light"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:40px 20px;">

  <!-- Logo -->
  <div style="text-align:center;margin-bottom:36px;">
    <span style="font-size:26px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">
      <span style="color:#FF9D3D;">iDoh</span><span style="color:#fff;"> ELITE</span>
    </span>
  </div>

  <!-- Hero -->
  <div style="background:#111;border:1px solid #1e1e1e;border-radius:20px;padding:36px 28px;margin-bottom:20px;text-align:center;">
    <div style="width:60px;height:60px;background:#FF9D3D;border-radius:50%;margin:0 auto 18px;line-height:60px;font-size:26px;text-align:center;">✓</div>
    <h1 style="color:#fff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px;">Commande confirmée</h1>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin:0;">${orderNumber}</p>
  </div>

  <!-- Message OpenAI -->
  <div style="background:#111;border-left:3px solid #FF9D3D;border-radius:0 14px 14px 0;padding:18px 22px;margin-bottom:20px;">
    <p style="color:#fff;font-size:15px;line-height:1.75;margin:0;font-style:italic;">"${hypeMessage}"</p>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:12px 0 0;">— iDoh ELITE</p>
  </div>

  <!-- Articles -->
  <div style="background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:22px 22px 14px;margin-bottom:20px;">
    <h2 style="color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 14px;">Articles commandés</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${itemsHtml}
      <tr><td colspan="2" style="height:8px;"></td></tr>
      <tr>
        <td style="padding:6px 0;color:#666;font-size:13px;">Sous-total</td>
        <td style="padding:6px 0;text-align:right;color:#999;font-size:13px;">${subtotal}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#666;font-size:13px;">Livraison</td>
        <td style="padding:6px 0;text-align:right;color:#999;font-size:13px;">${deliveryCost === "0,00 €" ? "Gratuite" : deliveryCost}</td>
      </tr>
      ${promoRow}
      <tr>
        <td style="padding:14px 0 0;color:#fff;font-weight:900;font-size:15px;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #222;">Total payé</td>
        <td style="padding:14px 0 0;text-align:right;color:#FF9D3D;font-weight:900;font-size:20px;border-top:1px solid #222;">${total}</td>
      </tr>
    </table>
  </div>

  <!-- Livraison -->
  <div style="background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:18px 22px;margin-bottom:32px;">
    <p style="color:#666;font-size:13px;margin:0 0 6px;">📦 Mode de livraison : <span style="color:#fff;font-weight:600;text-transform:capitalize;">${deliveryMethod}</span></p>
    <p style="color:#666;font-size:13px;margin:0 0 6px;">⚡ Expédition sous 24h ouvrées</p>
    <p style="color:#666;font-size:13px;margin:0;">↩️ Retours acceptés sous 30 jours</p>
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:32px;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/compte/commandes" style="display:inline-block;background:#FF9D3D;color:#fff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;padding:14px 32px;border-radius:12px;text-decoration:none;">Suivre ma commande</a>
  </div>

  <!-- Footer -->
  <div style="text-align:center;border-top:1px solid #1a1a1a;padding-top:24px;">
    <p style="color:#333;font-size:11px;margin:0;">© ${new Date().getFullYear()} iDoh ELITE · Tous droits réservés</p>
    <p style="color:#333;font-size:11px;margin:6px 0 0;">Tu reçois cet email car tu as passé une commande sur iDoh ELITE.</p>
  </div>

</div>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: `"iDoh ELITE" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `✓ Commande ${orderNumber} confirmée — iDoh ELITE`,
      html,
    });
    console.log("Email envoyé:", info.messageId, "→", email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
