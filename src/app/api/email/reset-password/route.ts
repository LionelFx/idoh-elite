import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { transporter } from "@/lib/mailer";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ ok: false, error: "Email requis" }, { status: 400 });

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/compte/nouveau-mot-de-passe`,
    },
  });

  if (error || !data?.properties?.action_link) {
    console.error("generateLink error:", error);
    return NextResponse.json({ ok: false, error: error?.message }, { status: 400 });
  }

  const resetUrl = data.properties.action_link;

  let hypeMessage = "Ton accès iDoh ELITE reste entre tes mains. Réinitialise ton mot de passe et reprends le contrôle en quelques secondes.";
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es le copywriter d'iDoh ELITE, une marque de sportswear premium et luxueux. Ton style est percutant, rassurant, élitiste, moderne. Tu tutoies toujours. Pas d'emojis. Génère uniquement le message demandé, sans titre ni signature.",
        },
        {
          role: "user",
          content:
            "Génère un message court pour accompagner un email de réinitialisation de mot de passe. Ton rassurant mais élitiste — l'accès à son compte reste sous contrôle. 2 phrases max. Commence directement.",
        },
      ],
      max_tokens: 80,
      temperature: 0.8,
    });
    hypeMessage = completion.choices[0]?.message?.content?.trim() ?? hypeMessage;
  } catch {
    // fallback silencieux
  }

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
    <div style="width:60px;height:60px;background:#1e1e1e;border:2px solid #FF9D3D;border-radius:50%;margin:0 auto 18px;line-height:56px;font-size:24px;text-align:center;">🔑</div>
    <h1 style="color:#fff;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px;">Réinitialisation</h1>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin:0;">Mot de passe</p>
  </div>

  <div style="background:#111;border-left:3px solid #FF9D3D;border-radius:0 14px 14px 0;padding:18px 22px;margin-bottom:24px;">
    <p style="color:#fff;font-size:15px;line-height:1.75;margin:0;font-style:italic;">"${hypeMessage}"</p>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:12px 0 0;">— iDoh ELITE</p>
  </div>

  <div style="background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:22px;margin-bottom:20px;">
    <p style="color:#999;font-size:13px;line-height:1.7;margin:0 0 20px;">Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable <strong style="color:#fff;">1 heure</strong>.</p>
    <div style="text-align:center;">
      <a href="${resetUrl}" style="display:inline-block;background:#FF9D3D;color:#fff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;padding:14px 36px;border-radius:12px;text-decoration:none;">
        Réinitialiser mon mot de passe
      </a>
    </div>
    <p style="color:#555;font-size:11px;margin:20px 0 0;text-align:center;">Si tu n'as pas demandé cette réinitialisation, ignore cet email. Ton compte est en sécurité.</p>
  </div>

  <div style="text-align:center;border-top:1px solid #1a1a1a;padding-top:24px;">
    <p style="color:#333;font-size:11px;margin:0;">© ${new Date().getFullYear()} iDoh ELITE · Tous droits réservés</p>
  </div>

</div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"iDoh ELITE" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🔑 Réinitialisation de ton mot de passe — iDoh ELITE",
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reset email send error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
