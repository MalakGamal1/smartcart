"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";

export function HomeHero() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const showSignup = hydrated && !user;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="hero-section"
    >
      {/* Decorative blobs */}
      <div className="hero-blob hero-blob--orange" />
      <div className="hero-blob hero-blob--blue" />

      <div className="relative z-10 max-w-2xl space-y-6">
        <Badge className="border-0 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)]">
          New season deals
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-lg">
          Laptops &amp; gear for work, play, and everything between.
        </h1>
        <p className="text-lg leading-relaxed text-slate-300">
          Browse curated categories, compare brands, and checkout in seconds —
          powered by the SmartCart API.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0"
          >
            <Link href="/products">
              Shop products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {showSignup ? (
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20"
            >
              <Link href="/signup">Create account</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Decorative laptop illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 text-7xl opacity-20 sm:block lg:right-16 lg:text-9xl"
        aria-hidden
      >
        💻
      </motion.div>
    </motion.section>
  );
}
