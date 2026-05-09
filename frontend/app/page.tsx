import Link from "next/link";
import { fetchFromBackend } from "@/lib/server-api";
import type { Category, CategoriesListResponse, Product, ProductsListResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { HomeHero } from "@/components/HomeHero";
import { PartnersSection } from "@/components/PartnersSection";

export const revalidate = 60;

export default async function HomePage() {
  let categories: Category[] = [];
  let featured: Product[] = [];

  try {
    const [catData, prodData] = await Promise.all([
      fetchFromBackend<CategoriesListResponse>("categories", { next: { revalidate: 120 } }),
      fetchFromBackend<ProductsListResponse>("products?inStock=true", { next: { revalidate: 60 } }),
    ]);
    categories = catData.categories ?? [];
    featured = (prodData.products ?? []).slice(0, 8);
  } catch {
    /* Backend may be offline during `next build`; page still renders empty sections. */
  }

  return (
    <div className="space-y-16">
      <HomeHero />

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-muted-foreground">Jump straight into what you need.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">View all</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c._id}
              href={`/products?category=${c._id}`}
              className="rounded-xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/50"
            >
              <p className="font-semibold">{c.name}</p>
              {c.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Featured in stock</h2>
            <p className="text-muted-foreground">Fresh picks with available inventory.</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      </section>

      <PartnersSection />
    </div>
  );
}
