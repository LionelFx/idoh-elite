import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `Tu es le directeur copywriting d'iDoh ELITE — marque de sportswear ultra-premium positionnée entre Nike et Louis Vuitton. Ta mission : rédiger des textes qui font ACHETER immédiatement. Tes principes :
- FOMO brutal : le client doit sentir qu'il rate quelque chose s'il n'agit pas maintenant
- Désir viscéral : il doit VOULOIR le produit avant même de finir de lire
- Exclusivité réelle : pas pour tout le monde, seulement pour les meilleurs
- Langage de la rue qui a réussi : percutant, direct, nerveux, sans fioriture
- Tu tutoies toujours. Zéro emoji. Zéro politesse creuse.
- Tu ne décris pas, tu VENDS. Chaque mot doit rapprocher du clic d'achat.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mode, type, name, category, brand, subject, text } = body;

  let prompt = "";
  let maxTokens = 130;

  // ── MODE REWRITE : transforme du texte existant en copywriting de feu ──
  if (mode === "rewrite") {
    if (!text?.trim()) {
      return NextResponse.json({ ok: false, error: "Texte requis." }, { status: 400 });
    }

    if (type === "newsletter-subject") {
      prompt = `Réécris ce sujet d'email pour qu'il soit irrésistible à ouvrir. Utilise 1 ou 2 emojis stratégiquement placés (début ou fin) pour attirer l'œil dans la boîte mail. Le sujet doit être court, nerveux, mystérieux ou urgent. Pas de guillemets.
Sujet original : "${text}"
Retourne uniquement le nouveau sujet avec les emojis, rien d'autre.`;
      maxTokens = 40;

    } else if (type === "newsletter") {
      prompt = `Réécris cette newsletter iDoh ELITE avec un copywriting de haut niveau. Garde les idées, amplifie l'impact. Structure : accroche choc → corps nerveux qui crée le désir → fin qui pousse à aller sur le site immédiatement. Commence directement par l'accroche.
Texte original :
${text}`;
      maxTokens = 600;

    } else if (type === "product-name") {
      prompt = `Réécris ce nom de produit pour qu'il soit plus accrocheur, premium, désirable. Court, percutant, mémorable. Garde le sens, booste l'impact. Retourne uniquement le nouveau nom.
Nom original : "${text}"`;
      maxTokens = 30;

    } else {
      // description produit par défaut
      prompt = `Réécris cette description produit avec un copywriting qui vend immédiatement. 2-3 phrases. La première crée un désir viscéral. Valorise ce que ça fait RESSENTIR. Termine sur une tension qui donne envie d'acheter maintenant.
Description originale : "${text}"`;
      maxTokens = 150;
    }

  // ── MODE GENERATE : génère à partir de zéro ──
  } else {
    if (!name) return NextResponse.json({ ok: false, error: "Nom requis." }, { status: 400 });

    if (type === "newsletter") {
      prompt = `Rédige une newsletter iDoh ELITE sur : "${subject || name}".
Structure : accroche qui claque (1 phrase choc) → corps qui crée le désir et l'urgence (2-3 paragraphes courts et nerveux) → call-to-action implicite qui donne envie d'aller sur le site maintenant.
Le lecteur doit finir l'email avec une envie irrésistible de cliquer. Commence directement par l'accroche.`;
      maxTokens = 500;
    } else {
      prompt = `Description produit pour : "${name}" — ${category || "Sportswear"} ${brand ? `| ${brand}` : ""}.
2-3 phrases maximum. La première phrase doit créer un désir immédiat. Valorise ce que ça fait RESSENTIR de porter ce produit — la puissance, le regard des autres, la supériorité. Termine sur une tension qui donne envie de l'avoir maintenant.`;
      maxTokens = 130;
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.92,
    });
    const result = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ ok: true, text: result });
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json({ ok: false, error: "Erreur OpenAI." }, { status: 500 });
  }
}
