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

  /** Resolve user label — handles deleted users (null/string id/isDeleted flag/snapshot) */
  const getUserString = (o: Order) => {
    const u = o.user;
    const snapName = o.customerSnapshot?.name || o.customerName;
    
    // Hard-deleted fallback (no populated user)
    if (!u || typeof u === "string") {
      if (snapName) {
        return `${snapName} (Deleted)`;
      }
      return typeof u === "string" ? `User #${u.slice(-6)} (Deleted)` : "(Deleted)";
    }

    // Populated user
    if ("name" in u) {
      if (u.isDeleted) {
        const name = snapName || u.name;
        return `${name} (Deleted)`;
      }
      return `${u.name} (${u.email})`;
    }

    return "(Deleted)";
  };

  const renderUserLabel = (o: Order) => {
    const u = o.user;
    const snapName = o.customerSnapshot?.name || o.customerName;
    const deletedBadge = (
      <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500/15 px-2 py-0.5 text-[12px] font-medium text-red-600 dark:text-red-400 border border-red-500/20">
        (Deleted)
      </span>
    );

    // If user was hard-deleted (null or just an unpopulated string ID)
    if (!u || typeof u === "string") {
      if (snapName) {
        return (
          <div className="flex items-center">
            <span>{snapName}</span> {deletedBadge}
          </div>
        );
      }
      // Absolute fallback if no snapshot exists (should only happen for very old hard-deleted orders)
      return <div className="flex items-center">{deletedBadge}</div>;
    }

    // If user is populated
    if ("name" in u) {
      if (u.isDeleted) {
        // Soft deleted user
        const name = snapName || u.name;
        return (
          <div className="flex items-center">
            <span>{name}</span> {deletedBadge}
          </div>
        );
      } else {
        // Active user
        return (
          <div className="flex items-center">
            <span>{u.name} ({u.email})</span>
          </div>
        );
      }
    }

    return <div className="flex items-center">{deletedBadge}</div>;
  };

  // ── Excel export ───────────────────────────────────────────────
  const exportExcel = () => {
    const rows = sorted.map((o) => ({
      "Order ID": `#${o._id.slice(-8)}`,
      Customer: getUserString(o),
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
                <TableHead>Items</TableHead>
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
                    {renderUserLabel(o)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={o.items.map((i) => `${(i.product as any)?.name} ×${i.quantity}`).join(", ")}>
                    {o.items.map((i) => (
                      <div key={i._id as string} className="text-sm">
                        <span className="font-medium text-primary">{(i.product as any)?.name || "Unknown Product"}</span>
                        <span className="text-muted-foreground ml-1">×{i.quantity}</span>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="font-semibold">${o.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="min-w-[160px]">
                    {(() => {
                      const isDeleted = !o.user || typeof o.user === "string" || o.user.isDeleted;
                      
                      if (o.status === "pending") {
                        if (isDeleted) {
                          return (
                            <div className="group relative inline-block">
                              <Button
                                size="sm"
                                disabled
                                className="bg-emerald-600/50 text-white cursor-not-allowed opacity-50"
                              >
                                Accept order
                              </Button>
                              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 w-max opacity-0 transition-opacity group-hover:opacity-100 bg-gray-900 text-white text-xs rounded py-1 px-2 z-10">
                                Cannot process orders for deleted users
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <Button
                            size="sm"
                            onClick={() => void updateStatus(o._id, "processing")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Accept order
                          </Button>
                        );
                      }
                      
                      return (
                        <span className="text-sm font-medium text-muted-foreground capitalize">{o.status}</span>
                      );
                    })()}
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
