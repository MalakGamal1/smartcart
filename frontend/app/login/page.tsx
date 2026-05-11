"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageMotion } from "@/components/PageMotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/ui/skeleton";

import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const expired = searchParams.get("expired");
  const hydrate = useAuthStore((s) => s.hydrate);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
      await hydrate();
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageMotion>
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Customer accounts only.{" "}
              <Link href="/admin/login" className="text-primary underline">
                Admin login
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expired ? (
              <p className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                Session expired — please sign in again.
              </p>
            ) : null}
            <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  pattern="[a-zA-Z0-9._%+\-]+@gmail\.com"
                  title="Please enter a valid Gmail address (e.g. user@gmail.com)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link href="/signup" className="font-medium text-primary underline">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageMotion>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-80 max-w-md rounded-xl" />}>
      <LoginForm />
    </Suspense>
  );
}
