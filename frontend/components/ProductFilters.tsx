"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Check, ChevronDown } from "lucide-react";
import * as RadixSelect from "@radix-ui/react-select";
import type { Category } from "@/types";

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState<string>("any");

  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  useEffect(() => {
    if (categories.length === 0) {
      // Fallback: fetch client-side if SSR failed
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.categories) setLocalCategories(data.categories);
        })
        .catch(() => {});
    } else {
      setLocalCategories(categories);
    }
  }, [categories]);

  const searchQ = searchParams.get("search") ?? "";
  const brandQ = searchParams.get("brand") ?? "";
  const categoryQ = searchParams.get("category") || "all";
  const minPriceQ = searchParams.get("minPrice") ?? "";
  const maxPriceQ = searchParams.get("maxPrice") ?? "";
  const inStockQ = searchParams.get("inStock") || "any";

  useEffect(() => {
    setSearch(searchQ);
    setBrand(brandQ);
    setCategory(categoryQ);
    setMinPrice(minPriceQ);
    setMaxPrice(maxPriceQ);
    setInStock(inStockQ);
  }, [searchQ, brandQ, categoryQ, minPriceQ, maxPriceQ, inStockQ]);

  const apply = useCallback((overrideCategory?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (brand) params.set("brand", brand);
    
    const catToUse = typeof overrideCategory === 'string' ? overrideCategory : category;
    if (catToUse && catToUse !== "all") params.set("category", catToUse);
    
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock === "true") params.set("inStock", "true");
    
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  }, [router, search, brand, category, minPrice, maxPrice, inStock]);

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 mb-8">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 md:col-span-2 lg:col-span-2">
          <Label htmlFor="search" className="text-foreground font-medium">Search</Label>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${search ? 'text-primary' : 'text-muted-foreground'}`} />
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="MacBook, Dell…"
              className={`pl-9 text-foreground bg-background transition-all ${search ? 'border-primary ring-1 ring-primary shadow-[0_0_10px_rgba(37,99,235,0.15)]' : 'border-input'}`}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Category</Label>
          <RadixSelect.Root value={category} onValueChange={(v) => { setCategory(v); apply(v); }}>
            <RadixSelect.Trigger className={`flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm text-foreground transition-all focus:outline-none focus:ring-1 focus:ring-primary ${category !== "all" ? "border-primary shadow-[0_0_10px_rgba(37,99,235,0.15)]" : "border-input"}`}>
              <RadixSelect.Value placeholder="All categories" />
              <RadixSelect.Icon>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </RadixSelect.Icon>
            </RadixSelect.Trigger>
            <RadixSelect.Portal>
              <RadixSelect.Content position="popper" sideOffset={4} className="relative z-50 min-w-[8rem] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
                <RadixSelect.Viewport className="p-1">
                  <RadixSelect.Item value="all" className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <RadixSelect.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </RadixSelect.ItemIndicator>
                    </span>
                    <RadixSelect.ItemText>All categories</RadixSelect.ItemText>
                  </RadixSelect.Item>
                  {localCategories.map((c) => (
                    <RadixSelect.Item key={c._id} value={c._id} className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <RadixSelect.ItemIndicator>
                          <Check className="h-4 w-4" />
                        </RadixSelect.ItemIndicator>
                      </span>
                      <RadixSelect.ItemText>{c.name}</RadixSelect.ItemText>
                    </RadixSelect.Item>
                  ))}
                </RadixSelect.Viewport>
              </RadixSelect.Content>
            </RadixSelect.Portal>
          </RadixSelect.Root>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-foreground font-medium">Brand</Label>
          <Input 
            id="brand" 
            value={brand} 
            onChange={(e) => setBrand(e.target.value)} 
            placeholder="e.g. Dell" 
            className={`text-foreground bg-background transition-all ${brand ? 'border-primary ring-1 ring-primary shadow-[0_0_10px_rgba(37,99,235,0.15)]' : 'border-input'}`}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPrice" className="text-foreground font-medium">Min price</Label>
          <Input
            id="minPrice"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min={0}
            className={`text-foreground bg-background transition-all ${minPrice ? 'border-primary ring-1 ring-primary shadow-[0_0_10px_rgba(37,99,235,0.15)]' : 'border-input'}`}
            placeholder="0"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxPrice" className="text-foreground font-medium">Max price</Label>
          <Input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min={0}
            className={`text-foreground bg-background transition-all ${maxPrice ? 'border-primary ring-1 ring-primary shadow-[0_0_10px_rgba(37,99,235,0.15)]' : 'border-input'}`}
            placeholder="10000"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
          />
        </div>
        <div className="md:col-span-2 flex items-end justify-end">
          <Button
            type="button"
            onClick={() => apply()}
            disabled={pending}
            className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] border-0 px-8"
          >
            {pending ? "Applying..." : "Apply Filters"}
          </Button>
        </div>
      </div>
    </div>
  );
}
