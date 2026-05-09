import { NextResponse } from "next/server";
import { SMARTCART_TOKEN_COOKIE } from "@/lib/auth-cookie";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SMARTCART_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
