import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { SMARTCART_TOKEN_COOKIE } from "@/lib/auth-cookie";
import type { JwtUser, UserRole } from "@/types";

export async function GET() {
  const token = cookies().get(SMARTCART_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ user: null as { id: string; role: UserRole } | null });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "JWT_SECRET not configured" }, { status: 500 });
  }
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, key);
    const user: JwtUser = {
      id: String(payload.id),
      role: payload.role as UserRole,
    };
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
