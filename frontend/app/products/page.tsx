import { Suspense } from "react";
import { fetchFromBackend } from "@/lib/server-api";
import type { CategoriesListResponse, Category, Product, ProductsListResponse } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

export const revalidate = 30;

function buildQuery(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  const pick = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const keys = ["search", "brand", "category", "minPrice", "maxPrice", "inStock"] as const;
  keys.forEach((k) => {
    const v = pick(k);
    if (v) params.set(k, v);
  });
  const q = params.toString();
  return q ? `products?${q}` : "products";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const path = buildQuery(searchParams);
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [prodData, catData] = await Promise.all([
      fetchFromBackend<ProductsListResponse>(path, { next: { revalidate: 30 } }),
      fetchFromBackend<CategoriesListResponse>("categories", { next: { revalidate: 120 } }),
    ]);
    products = prodData.products ?? [];
    categories = catData.categories ?? [];
  } catch {
    /* Backend offline at build time */
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">Filter by brand, price, category, and availability.</p>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <ProductFilters categories={categories} />
      </Suspense>
      {products.length === 0 ? (
        <p className="text-muted-foreground">No products match your filters.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
