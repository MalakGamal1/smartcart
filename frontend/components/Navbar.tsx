"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Moon, Sun, Menu, LogOut, User, Package } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { isAdminRole } from "@/lib/auth";
import { useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const logout = useAuthStore((s) => s.logout);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const itemCount = useCartStore((s) =>
    (s.cart?.items ?? []).reduce((n, i) => n + i.quantity, 0)
  );

  useEffect(() => {
    if (user && !isAdminRole(user.role)) {
      void fetchCart();
    }
  }, [user, fetchCart]);

  const onLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex items-center justify-center rounded-lg">
              <img src="/logo.svg" alt="SmartCart Logo" className="h-9 w-auto object-contain" />
            </span>
            <span className="hidden sm:inline">SmartCart</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Button variant={pathname === "/" ? "secondary" : "ghost"} asChild size="sm">
              <Link href="/">Home</Link>
            </Button>
            <Button variant={pathname.startsWith("/products") ? "secondary" : "ghost"} asChild size="sm">
              <Link href="/products">Products</Link>
            </Button>
            {user && !isAdminRole(user.role) && (
              <>
                <Button variant={pathname.startsWith("/cart") ? "secondary" : "ghost"} asChild size="sm">
                  <Link href="/cart">Cart</Link>
                </Button>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => document.getElementById("mobile-nav")?.classList.toggle("hidden")}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="hidden h-5 w-5 dark:inline-block" />
          </Button>

          {hydrated && user && isAdminRole(user.role) ? (
            <>
              <Button asChild size="sm" variant="secondary">
                <Link href="/admin">Admin</Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => void onLogout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          ) : null}

          {hydrated && user && !isAdminRole(user.role) ? (
            <>
              <Button
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0"
                size="sm"
                onClick={() => setDrawerOpen(true)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 ? (
                  <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{itemCount}</span>
                ) : null}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" size="icon" aria-label="Account">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    <Package className="mr-2 h-4 w-4" />
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLogout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}

          {hydrated && !user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <div id="mobile-nav" className="hidden border-t px-4 py-3 md:hidden">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" asChild className="justify-start">
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild className="justify-start">
            <Link href="/products">Products</Link>
          </Button>
          {user && !isAdminRole(user.role) ? (
            <>
              <Button variant="ghost" asChild className="justify-start">
                <Link href="/cart">Cart</Link>
              </Button>
            </>
          ) : null}
          {user && isAdminRole(user.role) ? (
            <Button variant="ghost" className="justify-start text-destructive" onClick={() => void onLogout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
