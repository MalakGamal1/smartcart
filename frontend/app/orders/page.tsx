"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { OrdersListResponse, Order } from "@/types";
import { PageMotion } from "@/components/PageMotion";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function OrdersContent() {
  const searchParams = useSearchParams();
  const submitted = searchParams.get("submitted") === "1";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<OrdersListResponse>("/orders");
        if (!cancelled) setOrders(data.orders ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageMotion>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Track purchases. You&apos;ll see <strong>Confirmed</strong> once an admin approves — that&apos;s when
            stock is deducted.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-950 dark:text-emerald-200">
            Order submitted. Status: <strong>Awaiting admin</strong>. Check back here after confirmation.
          </div>
        ) : null}

        <div className="rounded-lg border border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Flow:</strong> Pending → admin sets to Processing (confirmed,
          stock updated) → Shipped → Delivered.
        </div>

        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {!loading && orders.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground">No orders yet.</p>
            <Button asChild className="mt-4">
              <Link href="/products">Shop now</Link>
            </Button>
          </div>
        ) : null}
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-4"
            >
              <div>
                <p className="font-mono text-sm text-muted-foreground">#{o._id.slice(-8)}</p>
                <p className="text-lg font-semibold">${o.totalPrice.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                </p>
              </div>
              <OrderStatusBadge status={o.status} />
            </li>
          ))}
        </ul>
      </div>
    </PageMotion>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl rounded-xl" />}>
      <OrdersContent />
    </Suspense>
  );
}
