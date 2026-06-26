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
  const { id, reply } = await req.json();

  if (!id || !reply?.trim()) {
    return NextResponse.json({ ok: false, error: "Réponse vide." }, { status: 400 });
  }

  const { data: msg, error: fetchError } = await supabaseAdmin
    .from("contact_messages")
    .select("name, email, subject, message")
    .eq("id", id)
    .single();

  if (fetchError || !msg) {
    return NextResponse.json({ ok: false, error: "Message introuvable." }, { status: 404 });
  }

  const safeName = escapeHtml(msg.name);
  const safeReply = escapeHtml(reply).replace(/\n/g, "<br>");
  const safeOriginal = escapeHtml(msg.message).replace(/\n/g, "<br>");

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
    <div style="width:60px;height:60px;background:#FF9D3D;border-radius:50%;margin:0 auto 18px;line-height:60px;font-size:26px;text-align:center;">✓</div>
    <h1 style="color:#fff;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px;">On te répond</h1>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin:0;">Salut ${safeName}</p>
  </div>

  <div style="background:#111;border-left:3px solid #FF9D3D;border-radius:0 14px 14px 0;padding:18px 22px;margin-bottom:20px;">
    <p style="color:#fff;font-size:15px;line-height:1.75;margin:0;">${safeReply}</p>
    <p style="color:#FF9D3D;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:14px 0 0;">— L'équipe iDoh ELITE</p>
  </div>

  <div style="background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:18px 22px;margin-bottom:32px;">
    <p style="color:#666;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Ton message</p>
    <p style="color:#888;font-size:13px;line-height:1.7;margin:0;font-style:italic;">"${safeOriginal}"</p>
  </div>

  <div style="text-align:center;margin-bottom:32px;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" style="display:inline-block;background:#FF9D3D;color:#fff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;padding:14px 36px;border-radius:12px;text-decoration:none;">
      Découvrir la collection
    </a>
  </div>

  <div style="text-align:center;border-top:1px solid #1a1a1a;padding-top:24px;">
    <p style="color:#333;font-size:11px;margin:0;">© ${new Date().getFullYear()} iDoh ELITE · Tous droits réservés</p>
    <p style="color:#333;font-size:11px;margin:6px 0 0;">Tu reçois cet email car tu nous as contactés sur iDoh ELITE.</p>
  </div>

</div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"iDoh ELITE" <${process.env.GMAIL_USER}>`,
      to: msg.email,
      subject: `Re: ${msg.subject || "ta question"} — iDoh ELITE`,
      html,
    });
  } catch (err) {
    console.error("Reply email error:", err);
    return NextResponse.json({ ok: false, error: "Erreur d'envoi." }, { status: 500 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("contact_messages")
    .update({ status: "repondu", admin_reply: reply, replied_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    console.error("Reply status update error:", updateError);
  }

  return NextResponse.json({ ok: true });
}
