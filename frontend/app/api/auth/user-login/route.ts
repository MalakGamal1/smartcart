import { NextResponse } from "next/server";
import { SMARTCART_TOKEN_COOKIE } from "@/lib/auth-cookie";
import type { AuthLoginResponse } from "@/types";

const backendBase = () => process.env.BACKEND_URL || "http://localhost:3000";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${backendBase()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as AuthLoginResponse;
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  if (!data.token) {
    return NextResponse.json({ success: false, message: "No token returned" }, { status: 500 });
  }
  const response = NextResponse.json({ success: true, message: data.message });
  response.cookies.set(SMARTCART_TOKEN_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
