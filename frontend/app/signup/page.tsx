"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageMotion } from "@/components/PageMotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validation logic
  const nameValid = /^[a-zA-Z\s]+$/.test(name) && name.trim().length >= 3 && name.length <= 30;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const emailValid = emailRegex.test(email);

  const passLength = password.length >= 8;
  const passUpper = /[A-Z]/.test(password);
  const passLower = /[a-z]/.test(password);
  const passNum = /\d/.test(password);
  const passSpecial = /[@$!%*?&#]/.test(password);
  const passValid = passLength && passUpper && passLower && passNum && passSpecial;

  // Real-time styling
  const nameError = name.length > 0 && !nameValid;
  const emailError = email.length > 0 && !emailValid;
  
  const formValid = nameValid && emailValid && passValid;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase(), password }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }
      
      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center text-xs space-x-1.5 mt-1">
      {met ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-muted-foreground/50" />
      )}
      <span className={met ? "text-green-500 font-medium" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  );

  return (
    <PageMotion>
      <div className="mx-auto max-w-md">
        <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-2xl">
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Join SmartCart to save carts and place orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {successMsg ? (
              <div className="mb-4 rounded-md bg-green-500/15 border border-green-500/30 px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium animate-in fade-in slide-in-from-top-2">
                {successMsg}
              </div>
            ) : null}
            
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => {
                    const val = e.target.value;
                    // Only allow letters and spaces or empty
                    if (val === "" || /^[a-zA-Z\s]+$/.test(val)) {
                       setName(val);
                    }
                  }} 
                  className={`transition-colors ${
                    name.length > 0 
                      ? nameValid 
                        ? "border-green-500 focus-visible:ring-green-500" 
                        : "border-red-500 focus-visible:ring-red-500" 
                      : ""
                  }`}
                  placeholder="e.g. Malak Gamal"
                  required 
                />
                {nameError && (
                  <p className="text-xs text-red-500 animate-in fade-in">
                    Name must be 3-30 characters long.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`transition-colors ${
                    email.length > 0 
                      ? emailValid 
                        ? "border-green-500 focus-visible:ring-green-500" 
                        : "border-red-500 focus-visible:ring-red-500" 
                      : ""
                  }`}
                  placeholder="you@gmail.com"
                  pattern="[a-zA-Z0-9._%+\-]+@gmail\.com"
                  title="Please enter a valid Gmail address (e.g. user@gmail.com)"
                  required
                />
                {emailError && (
                  <p className="text-xs text-red-500 animate-in fade-in">
                    Please enter a valid Gmail address.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`pr-10 transition-colors ${
                      password.length > 0
                        ? passValid
                          ? "border-green-500 focus-visible:ring-green-500"
                          : "border-amber-500 focus-visible:ring-amber-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Meter & Requirements */}
                <div className="pt-2">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <RequirementItem met={passLength} text="Min 8 characters" />
                    <RequirementItem met={passUpper} text="1 uppercase letter" />
                    <RequirementItem met={passLower} text="1 lowercase letter" />
                    <RequirementItem met={passNum} text="1 number" />
                    <RequirementItem met={passSpecial} text="1 special char" />
                  </div>
                </div>
              </div>
              
              {error ? (
                <p className="text-sm text-red-500 font-medium bg-red-500/10 p-2 rounded animate-in fade-in">
                  {error}
                </p>
              ) : null}
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0 transition-all duration-300" 
                disabled={loading || !formValid}
              >
                {loading ? "Creating account…" : "Sign up"}
              </Button>
            </form>
            
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageMotion>
  );
}
