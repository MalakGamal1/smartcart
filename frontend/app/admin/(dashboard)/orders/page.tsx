"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { api } from "@/lib/api";
import type { Order, OrderStatus, OrdersListResponse } from "@/types";
import { PageMotion } from "@/components/PageMotion";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ, Download } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortTotal, setSortTotal] = useState<"asc" | "desc">("desc");

  const load = async () => {
    const { data } = await api.get<OrdersListResponse>("/orders");
    setOrders(data.orders ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const sorted = useMemo(() => {
    const list = [...orders];
    list.sort((a, b) => (sortTotal === "asc" ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice));
    return list;
  }, [orders, sortTotal]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await api.patch(`/orders/${id}/status`, { status });
    await load();
  };

  /** Resolve user label — handles deleted users (null/string id) */
  const getUserLabel = (u: Order["user"]) => {
    if (!u) return "Deleted user";
    if (typeof u === "string") return `User #${u.slice(-6)}`;
    if ("email" in u && u.email) return `${u.name ?? "Unknown"} (${u.email})`;
    return "Deleted user";
  };

  // ── Excel export ───────────────────────────────────────────────
  const exportExcel = () => {
    const rows = sorted.map((o) => ({
      "Order ID": `#${o._id.slice(-8)}`,
      Customer: getUserLabel(o.user),
      Total: `$${o.totalPrice.toFixed(2)}`,
      Status: o.status,
      "Created At": o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
      Items: (o.items ?? [])
        .map((i) => {
          const name =
            typeof i.product === "object" && i.product && "name" in i.product
              ? i.product.name
              : String(i.product);
          return `${name} ×${i.quantity}`;
        })
        .join("; "),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    // Auto column widths
    const colWidths = Object.keys(rows[0] ?? {}).map((k) => ({
      wch: Math.max(k.length, ...rows.map((r) => String((r as Record<string,string>)[k] ?? "").length)),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `SmartCart_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <PageMotion>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">
              Moving from <strong>Pending</strong> to <strong>Processing</strong>, <strong>Shipped</strong>, or{" "}
              <strong>Delivered</strong> confirms the sale and deducts stock.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortTotal((s) => (s === "asc" ? "desc" : "asc"))}
            >
              Sort total {sortTotal === "asc" ? <ArrowUpAZ className="ml-1 h-4 w-4" /> : <ArrowDownAZ className="ml-1 h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={exportExcel}
              disabled={sorted.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="font-mono text-xs">#{o._id.slice(-8)}</TableCell>
                  <TableCell>
                    {getUserLabel(o.user)}
                  </TableCell>
                  <TableCell className="font-semibold">${o.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="min-w-[160px]">
                    {o.status === "pending" ? (
                      <Button
                        size="sm"
                        onClick={() => void updateStatus(o._id, "processing")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Accept order
                      </Button>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground capitalize">{o.status}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageMotion>
  );
}
