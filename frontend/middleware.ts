import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";
import { SMARTCART_TOKEN_COOKIE } from "@/lib/auth-cookie";
import type { UserRole } from "@/types";

function getSecretBytes(): Uint8Array | null {
  const s = process.env.JWT_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const secret = getSecretBytes();
  if (!secret) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SMARTCART_TOKEN_COOKIE)?.value;

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jose.jwtVerify(token, secret);
      if ((payload.role as UserRole) !== "admin") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      const u = new URL("/admin/login", request.url);
      u.searchParams.set("expired", "1");
      return NextResponse.redirect(u);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/orders") || pathname.startsWith("/cart")) {
    if (!token) {
      const u = new URL("/login", request.url);
      u.searchParams.set("next", pathname);
      return NextResponse.redirect(u);
    }
    try {
      await jose.jwtVerify(token, secret);
    } catch {
      const u = new URL("/login", request.url);
      u.searchParams.set("expired", "1");
      return NextResponse.redirect(u);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders", "/orders/:path*", "/cart", "/cart/:path*", "/admin", "/admin/:path*"],
};
