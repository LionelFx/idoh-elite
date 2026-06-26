import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { transporter } from "@/lib/mailer";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CartItem {
  product: {
    name: string;
    images: string[];
    price: number;
    discount_percent?: number;
  };
  price: number;
  size: string;
  color: string;
  quantity: number;
}

interface Cart {
  id: string;
  user_email: string;
  user_first_name: string;
  items: CartItem[];
  updated_at: string;
  reminder_1_sent_at: string | null;
  reminder_2_sent_at: string | null;
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

const CART_SYSTEM = `Tu es le directeur copywriting d'iDoh ELITE — sportswear ultra-premium entre Nike et Louis Vuitton. Ta mission sur les emails de relance panier : convertir. Le client a failli acheter, il est chaud. Ton job c'est de le faire craquer maintenant.
Règles absolues :
- FOMO maximal : les stocks fondent, d'autres regardent ces pièces en ce moment
- Pas de supplique, pas de "reviens s'il te plaît" — tu ne mendies pas, tu rappelles ce qu'il va RATER
- Sentiment d'urgence réelle, pas artificielle : stock limité, pièces rares, drop culture
- Tu tutoies. Zéro emoji. Zéro phrase de politesse creuse.
- 2 phrases max. Chaque mot compte.`;

async function getHypeMessage(prenom: string, items: CartItem[], emailNum: 1 | 2): Promise<string> {
  const fallbacks = {
    1: `${prenom}, pendant que tu lis ça, d'autres ont les yeux sur les mêmes pièces — et eux, ils hésitent pas. Ton panier iDoh ELITE t'attend, mais le stock, lui, n'attend personne.`,
    2: `C'est la dernière fois qu'on te le rappelle, ${prenom} — après, ces pièces appartiennent à quelqu'un d'autre. Une commande. C'est tout ce qui te sépare de l'élite.`,
  };
  try {
    const productList = items.map(i => `${i.product.name} (x${i.quantity})`).join(", ");

    const prompt = emailNum === 1
      ? `Relance panier H+2 pour ${prenom}. Produits dans son panier : ${productList}. Il a failli acheter. Rappelle-lui sans supplier que ces pièces sont limitées et que d'autres les regardent. Crée une tension entre lui et le fait de passer à côté. 2 phrases max. Commence directement.`
      : `Relance panier H+24 pour ${prenom}. Produits : ${productList}. Dernière relance — après on passe à autre chose. Ton : glacial, factuel, FOMO brut. Il doit sentir que c'est maintenant ou jamais et que perdre ces pièces serait une erreur qu'il regrettera. 2 phrases max. Commence directement.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CART_SYSTEM },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.92,
    });
    return completion.choices[0]?.message?.content?.trim() ?? fallbacks[emailNum];
  } catch {
    return fallbacks[emailNum];
  }
}

function buildEmail(
  prenom: string,
  items: CartItem[],
  hypeMessage: string,
  emailNum: 1 | 2
): string {
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #222;">
        <span style="color:#fff;font-weight:600;font-size:14px;">${item.product.name}</span><br>
        <span style="color:#666;font-size:12px;">Taille ${item.size} · Qté ${item.quantity}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #222;text-align:right;color:#FF9D3D;font-weight:700;font-size:14px;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>`
    )
    .join("");

  const urgencyBadge = emailNum === 2
    ? `<div style="background:#FF9D3D20;border:1px solid #FF9D3D50;border-radius:10px;padding:12px 16px;margin-bottom:20px;text-align:center;">
        <p style="color:#FF9D3D;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 4px;">STOCK CRITIQUE</p>
        <p style="color:#fff;font-size:12px;margin:0;font-weight:600;">D'autres personnes regardent ces pièces en ce moment.</p>
      </div>`
    : `<div style="background:#ffffff08;border:1px solid #ffffff12;border-radius:10px;padding:10px 16px;margin-bottom:20px;text-align:center;">
        <p style="color:#999;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0;">Pièces en stock limité</p>
      </div>`;

  const ctaUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/cart`;

  return `<!DOCTYPE html>
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
    <div style="width:60px;height:60px;background:#1e1e1e;border:2px solid #FF9D3D;border-radius:50%;margin:0 auto 18px;line-height:56px;font-size:24px;text-align:center;">🛒</div>
    <h1 style="color:#fff;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px;">
      ${emailNum === 1 ? "Tu as oublié quelque chose" : "Dernière chance"}
    </h1>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin:0;">
      ${prenom}, ton panier t'attend
    </p>
  </div>

  <div style="background:#111;border-left:3px solid #FF9D3D;border-radius:0 14px 14px 0;padding:18px 22px;margin-bottom:20px;">
    <p style="color:#fff;font-size:15px;line-height:1.75;margin:0;font-style:italic;">"${hypeMessage}"</p>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:12px 0 0;">— iDoh ELITE</p>
  </div>

  <div style="background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:22px 22px 14px;margin-bottom:20px;">
    <h2 style="color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 14px;">Ton panier</h2>
    ${urgencyBadge}
    <table style="width:100%;border-collapse:collapse;">
      ${itemsHtml}
      <tr>
        <td style="padding:14px 0 0;color:#fff;font-weight:900;font-size:15px;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #222;">Total</td>
        <td style="padding:14px 0 0;text-align:right;color:#FF9D3D;font-weight:900;font-size:20px;border-top:1px solid #222;">${formatPrice(cartTotal)}</td>
      </tr>
    </table>
  </div>

  <div style="text-align:center;margin-bottom:32px;">
    <a href="${ctaUrl}" style="display:inline-block;background:#FF9D3D;color:#fff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;padding:14px 40px;border-radius:12px;text-decoration:none;">
      Finaliser ma commande
    </a>
  </div>

  <div style="text-align:center;border-top:1px solid #1a1a1a;padding-top:24px;">
    <p style="color:#333;font-size:11px;margin:0;">© ${new Date().getFullYear()} iDoh ELITE · Tous droits réservés</p>
    <p style="color:#333;font-size:11px;margin:6px 0 0;">Tu reçois cet email car tu as un panier en attente sur iDoh ELITE.</p>
  </div>

</div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  // Sécurité : Vercel Cron header OU secret manuel pour les tests
  const authHeader = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    querySecret === process.env.CRON_SECRET;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const twentyTwoHoursAgo = new Date(now.getTime() - 22 * 60 * 60 * 1000).toISOString();

  const { data: carts, error } = await supabaseAdmin
    .from("carts")
    .select("*")
    .neq("items", "[]");

  if (error) {
    console.error("Cron carts fetch error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!carts || carts.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "Aucun panier abandonné" });
  }

  let sent = 0;

  for (const cart of carts as Cart[]) {
    const items: CartItem[] = Array.isArray(cart.items) ? cart.items : [];
    if (items.length === 0) continue;

    const prenom = cart.user_first_name || "toi";

    try {
      // Email 1 — H+2 : panier pas touché depuis 2h, relance 1 pas encore envoyée
      if (!cart.reminder_1_sent_at && cart.updated_at < twoHoursAgo) {
        const hype = await getHypeMessage(prenom, items, 1);
        const html = buildEmail(prenom, items, hype, 1);
        await transporter.sendMail({
          from: `"iDoh ELITE" <${process.env.GMAIL_USER}>`,
          to: cart.user_email,
          subject: `⚡ ${prenom}, ces pièces ne t'attendront pas — iDoh ELITE`,
          html,
        });
        await supabaseAdmin.from("carts").update({ reminder_1_sent_at: now.toISOString() }).eq("id", cart.id);
        console.log(`Relance 1 envoyée → ${cart.user_email}`);
        sent++;
      }
      // Email 2 — H+24 : relance 1 envoyée il y a 22h+, relance 2 pas encore envoyée
      else if (cart.reminder_1_sent_at && !cart.reminder_2_sent_at && cart.reminder_1_sent_at < twentyTwoHoursAgo) {
        const hype = await getHypeMessage(prenom, items, 2);
        const html = buildEmail(prenom, items, hype, 2);
        await transporter.sendMail({
          from: `"iDoh ELITE" <${process.env.GMAIL_USER}>`,
          to: cart.user_email,
          subject: `🔥 ${prenom}, c'est maintenant ou jamais — iDoh ELITE`,
          html,
        });
        await supabaseAdmin.from("carts").update({ reminder_2_sent_at: now.toISOString() }).eq("id", cart.id);
        console.log(`Relance 2 envoyée → ${cart.user_email}`);
        sent++;
      }
    } catch (err) {
      console.error(`Erreur relance pour ${cart.user_email}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
