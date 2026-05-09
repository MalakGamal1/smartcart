import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, FolderTree, ClipboardList, Users } from "lucide-react";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit space-y-2 rounded-xl border border-border/80 bg-card p-3 lg:sticky lg:top-20">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</p>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/admin">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/admin/products">
            <Package className="mr-2 h-4 w-4" />
            Products
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/admin/categories">
            <FolderTree className="mr-2 h-4 w-4" />
            Categories
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/admin/orders">
            <ClipboardList className="mr-2 h-4 w-4" />
            Orders
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/admin/users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Storefront</Link>
        </Button>
      </aside>
      <div>{children}</div>
    </div>
  );
}
