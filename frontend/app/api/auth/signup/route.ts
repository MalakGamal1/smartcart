import { NextResponse } from "next/server";
import type { SignupResponse } from "@/types";

const backendBase = () => process.env.BACKEND_URL || "http://localhost:3000";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${backendBase()}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as SignupResponse;
  return NextResponse.json(data, { status: res.status });
}
