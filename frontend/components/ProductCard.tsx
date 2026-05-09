"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { isAdminRole } from "@/lib/auth";
import { useState } from "react";

function categoryName(p: Product) {
  const c = p.category;
  return typeof c === "object" && c && "name" in c ? c.name : "Laptop";
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const [busy, setBusy] = useState(false);

  const img = product.images?.[0];
  const canBuy = user && !isAdminRole(user.role) && product.stock > 0;

  const onAdd = async () => {
    if (!canBuy) return;
    setBusy(true);
    try {
      await addToCart(product._id);
      setDrawerOpen(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="h-full"
    >
      <Card className="glass-card group flex h-full flex-col overflow-hidden border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(37,99,235,0.25)]">
        <CardHeader className="p-0 relative">
          <Link
            href={`/products/${product._id}`}
            className="product-image-wrapper block"
          >
            {img ? (
              <Image
                src={img}
                alt={product.name}
                fill
                unoptimized
                className="object-contain p-6 transition-transform duration-500 group-hover:scale-105 drop-shadow-lg"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}
          </Link>
          {product.stock <= 0 && (
            <div 
              className="absolute right-3 top-3 z-20 font-semibold text-white pointer-events-none"
              style={{
                background: "#DC2626",
                borderRadius: "10px",
                padding: "6px 12px",
                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.35)",
                fontSize: "12px",
                letterSpacing: "0.5px"
              }}
            >
              Out of stock
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground">{categoryName(product)}</Badge>
            {product.brand && <Badge variant="outline" className="border-border text-muted-foreground">{product.brand}</Badge>}
          </div>
          <Link href={`/products/${product._id}`} className="line-clamp-2 font-semibold hover:text-accent transition-colors">
            {product.name}
          </Link>
          <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="mt-auto gap-2 p-4 pt-0">
          <Button asChild variant="outline" className="flex-1 border-border hover:bg-secondary/50">
            <Link href={`/products/${product._id}`}>Details</Link>
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0"
            disabled={!canBuy || busy}
            onClick={() => void onAdd()}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
