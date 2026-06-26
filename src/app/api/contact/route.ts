import { NextRequest, NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";
import { supabaseAdmin } from "@/lib/supabase-admin";

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Champs manquants." }, { status: 400 });
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Email invalide." }, { status: 400 });
  }

  const { error: insertError } = await supabaseAdmin
    .from("contact_messages")
    .insert({ name, email, subject: subject || null, message });

  if (insertError) {
    console.error("Contact insert error:", insertError);
    return NextResponse.json({ ok: false, error: "Erreur d'enregistrement." }, { status: 500 });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject || "—");
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

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
  <div style="background:#111;border:1px solid #1e1e1e;border-radius:20px;padding:30px 28px;margin-bottom:20px;">
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 18px;">Nouveau message de contact</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
      <tr><td style="padding:4px 0;color:#666;font-size:13px;width:90px;vertical-align:top;">Nom</td><td style="padding:4px 0;color:#fff;font-size:13px;font-weight:600;">${safeName}</td></tr>
      <tr><td style="padding:4px 0;color:#666;font-size:13px;vertical-align:top;">Email</td><td style="padding:4px 0;color:#fff;font-size:13px;font-weight:600;">${safeEmail}</td></tr>
      <tr><td style="padding:4px 0;color:#666;font-size:13px;vertical-align:top;">Sujet</td><td style="padding:4px 0;color:#fff;font-size:13px;font-weight:600;">${safeSubject}</td></tr>
    </table>
    <div style="background:#0a0a0a;border-left:3px solid #FF9D3D;border-radius:0 12px 12px 0;padding:16px 18px;">
      <p style="color:#ddd;font-size:14px;line-height:1.7;margin:0;">${safeMessage}</p>
    </div>
  </div>
  <div style="text-align:center;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/messages" style="display:inline-block;background:#FF9D3D;color:#fff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;padding:14px 32px;border-radius:12px;text-decoration:none;">Répondre depuis l'admin</a>
  </div>
</div>
</body>
</html>`;

  // Notification admin (fire & forget) — le message est déjà enregistré, c'est ce qui compte.
  transporter.sendMail({
    from: `"iDoh ELITE — Contact" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: `📩 ${subject || "Nouveau message"} — ${name}`,
    html,
  }).catch(err => console.error("Contact notification email error:", err));

  return NextResponse.json({ ok: true });
}
