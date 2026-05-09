"use client";

import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { Trash2 } from "lucide-react";
import type { Product } from "@/types";

function lineName(product: Product | string) {
  if (typeof product === "object" && product && "name" in product) return product.name;
  return "Product";
}

function linePrice(product: Product | string) {
  if (typeof product === "object" && product && "price" in product) return product.price;
  return 0;
}

function lineImage(product: Product | string) {
  if (typeof product === "object" && product && "images" in product) return product.images?.[0];
  return undefined;
}

export function CartDrawer() {
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const cart = useCartStore((s) => s.cart);
  const loading = useCartStore((s) => s.loading);
  const removeLine = useCartStore((s) => s.removeLine);

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, line) => sum + linePrice(line.product) * line.quantity, 0);

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>
        <ScrollArea className="mt-4 flex-1 pr-2">
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {!loading && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Cart is empty.</p>
          ) : null}
          <ul className="space-y-4">
            {items.map((line) => {
              const id =
                typeof line.product === "object" && line.product && "_id" in line.product
                  ? line.product._id
                  : String(line.product);
              const img = lineImage(line.product);
              return (
                <li key={id} className="flex gap-3">
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-muted">
                    {img ? (
                      <Image src={img} alt="" fill className="object-contain p-1.5" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{lineName(line.product)}</p>
                    <p className="text-sm text-muted-foreground">Qty {line.quantity}</p>
                    <p className="text-sm font-semibold text-primary">
                      ${(linePrice(line.product) * line.quantity).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    aria-label="Remove"
                    onClick={() => void removeLine(id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
        <Separator className="my-4" />
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-lg font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0">
            <Link href="/cart" onClick={() => setDrawerOpen(false)}>
              View cart & checkout
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
