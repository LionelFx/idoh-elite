import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { transporter } from "@/lib/mailer";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function generateDiscountCode(): string {
  return `ELITE10-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  const { email, discount } = await req.json();
  if (!email?.match(/^[^@]+@[^@]+\.[^@]+$/)) {
    return NextResponse.json({ ok: false, error: "Email invalide." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("newsletter_subscribers").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: false, error: "Cet email est déjà inscrit." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Une erreur est survenue." }, { status: 500 });
  }

  // Code promo de bienvenue — unique par inscription, 1 seule utilisation, expire après 24h
  // (urgence volontaire). Demande explicite de l'utilisateur, seulement pour le popup -10%.
  let promoCode: string | null = null;
  let expiresAt: Date | null = null;
  if (discount) {
    promoCode = generateDiscountCode();
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const { error: promoError } = await supabaseAdmin.from("promo_codes").insert({
      code: promoCode,
      discount_type: "percent",
      discount_value: 10,
      min_order: 0,
      expires_at: expiresAt.toISOString(),
      max_uses: 1,
      uses_count: 0,
      active: true,
    });
    if (promoError) {
      console.error("Erreur création code promo bienvenue:", promoError);
      promoCode = null;
      expiresAt = null;
    }
  }

  // Email de bienvenue (fire & forget)
  let hypeMessage = "La majorité attendait. Toi tu viens de passer de l'autre côté. Les drops limités, les offres réservées aux membres et les pièces qui partent en heures — tout ça arrive maintenant directement chez toi.";
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es le directeur copywriting d'iDoh ELITE. Ton style : percutant, élitiste, FOMO intense. Tu tutoies. Zéro emoji. Zéro banalité. Chaque phrase doit faire sentir au lecteur qu'il vient de prendre la meilleure décision de sa vie et qu'il va maintenant avoir accès à ce que les autres n'ont pas.`,
        },
        {
          role: "user",
          content: `Message de bienvenue newsletter iDoh ELITE. 2 phrases max. La première doit créer un sentiment de victoire d'être inscrit. La deuxième doit créer une attente fébrile pour les prochains emails. Univers : drop culture, luxe streetwear, accès VIP. Commence directement.`,
        },
      ],
      max_tokens: 90,
      temperature: 0.92,
    });
    hypeMessage = completion.choices[0]?.message?.content?.trim() ?? hypeMessage;
  } catch { /* fallback */ }

  const expiryLabel = expiresAt
    ? expiresAt.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : null;

  const discountBlock = promoCode ? `
  <div style="background:#111;border:2px solid #FF9D3D;border-radius:16px;padding:28px;margin-bottom:20px;text-align:center;">
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">Ton code -10%</p>
    <p style="color:#fff;font-size:26px;font-weight:900;letter-spacing:3px;font-family:monospace;margin:0 0 14px;">${promoCode}</p>
    <p style="color:#999;font-size:12px;margin:0;line-height:1.6;">Valable une seule fois, jusqu'au <strong style="color:#fff;">${expiryLabel}</strong> — soit 24h. Passé ce délai, le code expire définitivement.</p>
  </div>` : "";

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
    <div style="width:60px;height:60px;background:#FF9D3D;border-radius:50%;margin:0 auto 18px;line-height:60px;font-size:26px;text-align:center;">★</div>
    <h1 style="color:#fff;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px;">Accès privilégié</h1>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin:0;">Tu fais partie de l'élite</p>
  </div>
  ${discountBlock}
  <div style="background:#111;border-left:3px solid #FF9D3D;border-radius:0 14px 14px 0;padding:18px 22px;margin-bottom:20px;">
    <p style="color:#fff;font-size:15px;line-height:1.75;margin:0;font-style:italic;">"${hypeMessage}"</p>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:12px 0 0;">— iDoh ELITE</p>
  </div>
  <div style="text-align:center;margin-bottom:32px;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" style="display:inline-block;background:#FF9D3D;color:#fff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;padding:14px 36px;border-radius:12px;text-decoration:none;">
      Découvrir la collection
    </a>
  </div>
  <div style="text-align:center;border-top:1px solid #1a1a1a;padding-top:24px;">
    <p style="color:#333;font-size:11px;margin:0;">© ${new Date().getFullYear()} iDoh ELITE · Tous droits réservés</p>
    <p style="color:#333;font-size:11px;margin:6px 0 0;">Tu reçois cet email car tu t'es inscrit à la newsletter iDoh ELITE.</p>
    <p style="color:#555;font-size:11px;margin:10px 0 0;">Tu ne le vois pas dans ta boîte de réception ? Vérifie ton dossier <strong style="color:#888;">spam</strong> ou courrier indésirable.</p>
  </div>
</div>
</body>
</html>`;

  transporter.sendMail({
    from: `"iDoh ELITE" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: promoCode ? "⚡ Ton code -10% — valable 24h seulement" : "🏆 Bienvenue dans l'élite — iDoh ELITE",
    html,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
