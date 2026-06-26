import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { transporter } from "@/lib/mailer";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName, orderId } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email et mot de passe requis." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "Mot de passe trop court (min. 6 caractères)." }, { status: 400 });
  }

  // Crée l'utilisateur ET génère le lien de confirmation en une seule opération
  let { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: { first_name: firstName || "", last_name: lastName || "" },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/compte/confirme`,
    },
  });

  // Email déjà pris : si le compte existant n'a JAMAIS été confirmé, on régénère un lien
  // (magiclink — fonctionne pour un utilisateur existant) au lieu de bloquer la personne
  // sans aucun recours (cas vécu : 1er lien cassé, impossible de réessayer ensuite).
  if (error?.message?.toLowerCase().includes("already")) {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const existing = usersData?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (existing && !existing.email_confirmed_at) {
      const retry = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/compte/confirme` },
      });
      data = retry.data;
      error = retry.error;
    }
  }

  if (error || !data?.properties?.action_link) {
    const raw = error?.message?.toLowerCase() ?? "";
    let msg = "Une erreur est survenue. Réessaie.";
    if (raw.includes("already") || raw.includes("email")) {
      msg = "Cette adresse email est déjà utilisée. Connecte-toi ou utilise « Mot de passe oublié ».";
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  // Rattache une commande passée en invité au compte qu'on vient de créer — seulement si
  // elle n'a pas déjà de titulaire et que l'email correspond (sécurité : on ne laisse pas
  // n'importe qui s'attribuer une commande au hasard via son id).
  if (orderId) {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, customer_email")
      .eq("id", orderId)
      .single();
    if (order && !order.user_id && order.customer_email?.toLowerCase() === email.toLowerCase()) {
      await supabaseAdmin.from("orders").update({ user_id: data.user.id }).eq("id", orderId);
    }
  }

  const confirmUrl = data.properties.action_link;
  const prenom = firstName || "futur membre";

  let hypeMessage = `${prenom}, t'as pas choisi une marque — t'as choisi un niveau. Confirme ton compte et accède à ce que la plupart ne verront jamais.`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es le directeur copywriting d'iDoh ELITE. Ton rôle : accueillir un nouveau membre comme s'il venait d'intégrer un cercle très fermé. Style : percutant, élitiste, drop culture, luxe streetwear. Tu tutoies. Zéro emoji. Zéro cliché de bienvenue classique. Le client doit sentir qu'il a fait le bon choix et avoir envie de confirmer son compte MAINTENANT.`,
        },
        {
          role: "user",
          content: `Message de bienvenue pour ${prenom} qui vient de créer son compte iDoh ELITE. 2 phrases max. La première l'ancre dans l'élite. La deuxième crée une urgence à confirmer son compte pour ne pas passer à côté. Commence directement.`,
        },
      ],
      max_tokens: 90,
      temperature: 0.92,
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
    <div style="width:60px;height:60px;background:#FF9D3D;border-radius:50%;margin:0 auto 18px;line-height:60px;font-size:26px;text-align:center;">★</div>
    <h1 style="color:#fff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px;">Bienvenue</h1>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin:0;">dans l'élite</p>
  </div>

  <div style="background:#111;border-left:3px solid #FF9D3D;border-radius:0 14px 14px 0;padding:18px 22px;margin-bottom:24px;">
    <p style="color:#fff;font-size:15px;line-height:1.75;margin:0;font-style:italic;">"${hypeMessage}"</p>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:12px 0 0;">— iDoh ELITE</p>
  </div>

  <div style="background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:22px;margin-bottom:20px;">
    <p style="color:#999;font-size:13px;line-height:1.7;margin:0 0 20px;">Une dernière étape : confirme ton adresse email pour activer ton compte iDoh ELITE.</p>
    <div style="text-align:center;">
      <a href="${confirmUrl}" style="display:inline-block;background:#FF9D3D;color:#fff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;padding:14px 36px;border-radius:12px;text-decoration:none;">
        Confirmer mon compte
      </a>
    </div>
    <p style="color:#555;font-size:11px;margin:20px 0 0;text-align:center;">Ce lien est valable 24 heures. Si tu n'es pas à l'origine de cette inscription, ignore cet email.</p>
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
      subject: `⚡ Bienvenue chez iDoh ELITE — Confirme ton compte`,
      html,
    });
  } catch (err) {
    console.error("Welcome email error:", err);
    // On ne bloque pas l'inscription si l'email échoue
  }

  return NextResponse.json({ ok: true });
}
