import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { transporter } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { subject, html } = await req.json();
  if (!subject || !html) {
    return NextResponse.json({ ok: false, error: "Sujet et contenu requis." }, { status: 400 });
  }

  const { data: subscribers, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("email")
    .eq("active", true);

  if (error || !subscribers?.length) {
    return NextResponse.json({ ok: false, error: "Aucun abonné actif." }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://idohelite.fr";

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    try {
      await transporter.sendMail({
        from: `"iDoh ELITE" <${process.env.GMAIL_USER}>`,
        to: sub.email,
        subject,
        html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="only light"><meta name="supported-color-schemes" content="only light"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <span style="font-size:26px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">
      <span style="color:#FF9D3D;">iDoh</span><span style="color:#fff;"> ELITE</span>
    </span>
  </div>
  <div style="background:#111;border:1px solid #1e1e1e;border-radius:20px;padding:32px 28px;margin-bottom:20px;color:#d0d0d0;font-size:15px;line-height:1.8;">
    ${html.replace(/\n\n/g, '</p><p style="margin:0 0 16px;color:#d0d0d0;font-size:15px;line-height:1.8;">').replace(/\n/g, "<br>")}
  </div>
  <div style="text-align:center;margin-bottom:28px;">
    <a href="${siteUrl}/products" style="display:inline-block;background:#FF9D3D;color:#fff;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:2px;padding:14px 36px;border-radius:12px;text-decoration:none;">
      Voir la collection
    </a>
  </div>
  <div style="text-align:center;border-top:1px solid #1a1a1a;padding-top:20px;">
    <p style="color:#333;font-size:11px;margin:0;">© ${new Date().getFullYear()} iDoh ELITE</p>
  </div>
</div>
</body>
</html>`,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: subscribers.length });
}
