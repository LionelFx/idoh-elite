import { NextRequest, NextResponse } from "next/server";

const COOKIE = "idoh_admin";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const validEmail    = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return NextResponse.json({ error: "Admin non configuré." }, { status: 500 });
  }

  if (email !== validEmail || password !== validPassword) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 heures
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
