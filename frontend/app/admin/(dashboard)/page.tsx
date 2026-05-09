"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CategoriesListResponse, OrdersListResponse, ProductsListResponse, UsersListResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageMotion } from "@/components/PageMotion";

export default function AdminHomePage() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, users: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, c, o, u] = await Promise.all([
          api.get<ProductsListResponse>("/products"),
          api.get<CategoriesListResponse>("/categories"),
          api.get<OrdersListResponse>("/orders"),
          api.get<UsersListResponse>("/users"),
        ]);
        if (cancelled) return;
        setStats({
          products: p.data.count ?? p.data.products?.length ?? 0,
          categories: c.data.count ?? c.data.categories?.length ?? 0,
          orders: o.data.count ?? o.data.orders?.length ?? 0,
          users: u.data.users?.length ?? 0,
        });
      } catch {
        /* handled by interceptor */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tiles = [
    { label: "Products", value: stats.products },
    { label: "Categories", value: stats.categories },
    { label: "Orders", value: stats.orders },
    { label: "Users", value: stats.users },
  ];

  return (
    <PageMotion>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your SmartCart catalog and operations.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((t) => (
            <Card key={t.label}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{t.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageMotion>
  );
}
