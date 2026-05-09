import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchFromBackend } from "@/lib/server-api";
import type { ProductResponse, ProductsListResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ProductDetailActions } from "@/components/ProductDetailActions";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const data = await fetchFromBackend<ProductsListResponse>("products?inStock=true", {
      next: { revalidate: 60 },
    });
    return (data.products ?? []).slice(0, 16).map((p) => ({ id: p._id }));
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  let data: ProductResponse;
  try {
    data = await fetchFromBackend<ProductResponse>(`products/${params.id}`, { next: { revalidate: 60 } });
  } catch {
    notFound();
  }

  const product = data.product;
  const cat = product.category;
  const catLabel = typeof cat === "object" && cat && "name" in cat ? cat.name : "Category";
  const img = product.images?.[0];

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-neutral-100 to-neutral-200/80 dark:from-muted dark:to-muted/60">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-contain p-8"
            unoptimized
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}
      </div>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{catLabel}</Badge>
          {product.brand ? <Badge variant="outline">{product.brand}</Badge> : null}
          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
        <p className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
        {product.description ? (
          <p className="leading-relaxed text-muted-foreground">{product.description}</p>
        ) : null}
        <ProductDetailActions product={product} />
      </div>
    </div>
  );
}
