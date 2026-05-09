"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { isAdminRole } from "@/lib/auth";
import type { Product } from "@/types";

export function ProductDetailActions({ product }: { product: Product }) {
  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const [busy, setBusy] = useState(false);

  const [qty, setQty] = useState(1);

  const canBuy = user && !isAdminRole(user.role) && product.stock > 0;

  const onAdd = async () => {
    if (!canBuy) return;
    setBusy(true);
    try {
      await addToCart(product._id, qty);
      setDrawerOpen(true);
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        <a href="/login" className="font-medium text-primary underline">
          Sign in
        </a>{" "}
        to add items to your cart.
      </p>
    );
  }

  if (isAdminRole(user.role)) {
    return <p className="text-sm text-muted-foreground">Admins manage inventory from the admin panel.</p>;
  }

  const maxQty = Math.min(product.stock, 10);
  const qtyOptions = Array.from({ length: maxQty }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-4">
      {product.stock > 0 ? (
        <select
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          disabled={busy}
          className="h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {qtyOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      ) : null}
      <Button
        size="lg"
        disabled={!canBuy || busy}
        className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0 flex-1 sm:flex-none"
        onClick={() => void onAdd()}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {product.stock <= 0 ? "Out of stock" : "Add to cart"}
      </Button>
    </div>
  );
}
