import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";

const styles: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-800 dark:text-amber-400",
  processing: "bg-blue-500/15 text-blue-800 dark:text-blue-400",
  shipped: "bg-violet-500/15 text-violet-800 dark:text-violet-400",
  delivered: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
};

/** User-facing labels: pending = awaiting admin; processing = confirmed & stock updated */
const labels: Record<OrderStatus, string> = {
  pending: "Awaiting admin",
  processing: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={styles[status] ?? ""} title={status}>
      {labels[status] ?? status}
    </Badge>
  );
}
