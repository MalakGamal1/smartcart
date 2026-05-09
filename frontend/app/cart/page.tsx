"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { PageMotion } from "@/components/PageMotion";
import type { Product } from "@/types";
import { Trash2 } from "lucide-react";

function price(p: Product | string) {
  return typeof p === "object" && p && "price" in p ? p.price : 0;
}
function title(p: Product | string) {
  return typeof p === "object" && p && "name" in p ? p.name : "Product";
}
function img(p: Product | string) {
  return typeof p === "object" && p && "images" in p ? p.images?.[0] : undefined;
}
function pid(p: Product | string) {
  return typeof p === "object" && p && "_id" in p ? p._id : String(p);
}

export default function CartPage() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const removeLine = useCartStore((s) => s.removeLine);
  const placeOrder = useCartStore((s) => s.placeOrder);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, l) => s + price(l.product) * l.quantity, 0);

  const checkout = async () => {
    setBusy(true);
    try {
      await placeOrder();
      router.push("/orders?submitted=1");
    } catch {
      /* toast optional */
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageMotion>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Cart</h1>
          <p className="text-muted-foreground">Review items and place your order.</p>
        </div>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4">
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4">
            <ul className="divide-y">
              {items.map((line) => {
                const id = pid(line.product);
                const image = img(line.product);
                return (
                  <li key={id} className="flex gap-4 py-4 first:pt-0">
                    <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-muted">
                      {image ? (
                        <Image src={image} alt="" fill className="object-contain p-2" unoptimized />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{title(line.product)}</p>
                      <p className="text-sm text-muted-foreground">Qty {line.quantity}</p>
                      <p className="text-sm font-semibold text-primary">
                        ${(price(line.product) * line.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => void removeLine(id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-200">
              An admin must confirm your purchase. Inventory is reduced only after the order moves to{" "}
              <strong>Confirmed</strong> (processing).
            </p>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0"
              disabled={busy}
              onClick={() => void checkout()}
            >
              Place order
            </Button>
          </div>
        )}
      </div>
    </PageMotion>
  );
}
