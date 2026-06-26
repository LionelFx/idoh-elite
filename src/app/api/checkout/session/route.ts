import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "session_id manquant." }, { status: 400 });
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .single();

  if (error || !order) {
    return NextResponse.json({ ok: false, error: "Commande introuvable." }, { status: 404 });
  }

  const { data: items } = await supabaseAdmin.from("order_items").select("*").eq("order_id", order.id);

  return NextResponse.json({ ok: true, order, items: items ?? [] });
}
