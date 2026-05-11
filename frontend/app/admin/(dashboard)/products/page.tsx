"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { api } from "@/lib/api";
import type { CategoriesListResponse, Product, ProductsListResponse } from "@/types";
import { PageMotion } from "@/components/PageMotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import * as RadixSelect from "@radix-ui/react-select";
import { ArrowDownAZ, ArrowUpAZ, Minus, Pencil, Plus, Trash2, Check, ChevronDown, Download } from "lucide-react";

type SortKey = "name" | "price" | "stock";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  brand: "",
  images: "",
};

type FieldErrors = Partial<Record<keyof typeof emptyForm, string>>;

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-xs font-medium text-destructive mt-1">{msg}</p> : null;

const ProductForm = ({
  f,
  onChange,
  categories,
  fieldErrors = {},
}: {
  f: typeof emptyForm;
  onChange: (field: keyof typeof emptyForm, val: string) => void;
  categories: { _id: string; name: string }[];
  fieldErrors?: FieldErrors;
}) => (
  <div className="grid gap-3 py-2">
    <div className="space-y-1">
      <Label>Name *</Label>
      <Input value={f.name} onChange={(e) => onChange("name", e.target.value)} className={fieldErrors.name ? "border-destructive" : ""} />
      <FieldError msg={fieldErrors.name} />
    </div>
    <div className="space-y-1">
      <Label>Description</Label>
      <Input value={f.description} onChange={(e) => onChange("description", e.target.value)} />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-1">
        <Label>Price ($) *</Label>
        <Input type="number" min="1" step="any" value={f.price} onChange={(e) => onChange("price", e.target.value)} className={fieldErrors.price ? "border-destructive" : ""} />
        <FieldError msg={fieldErrors.price} />
      </div>
      <div className="space-y-1">
        <Label>Stock *</Label>
        <Input type="number" min="0" step="1" value={f.stock} onChange={(e) => onChange("stock", e.target.value)} className={fieldErrors.stock ? "border-destructive" : ""} />
        <FieldError msg={fieldErrors.stock} />
      </div>
    </div>
    <div className="space-y-1">
      <Label>Category *</Label>
      <RadixSelect.Root value={f.category} onValueChange={(v) => onChange("category", v ?? "")}>
        <RadixSelect.Trigger className={`flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${fieldErrors.category ? "border-destructive" : "border-input"}`}>
          <RadixSelect.Value placeholder="Select category" />
          <RadixSelect.Icon>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content position="popper" sideOffset={4} className="relative z-50 min-w-[8rem] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
            <RadixSelect.Viewport className="h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] p-1">
              {categories.map((c) => (
                <RadixSelect.Item key={c._id} value={c._id} className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
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
      <FieldError msg={fieldErrors.category} />
    </div>
    <div className="space-y-1">
      <Label>Brand</Label>
      <Input value={f.brand} onChange={(e) => onChange("brand", e.target.value)} />
    </div>
    <div className="space-y-1">
      <Label>Images (comma-separated URLs)</Label>
      <Input value={f.images} onChange={(e) => onChange("images", e.target.value)} />
    </div>
  </div>
);

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validateForm = (f: typeof emptyForm): FieldErrors => {
    const errs: FieldErrors = {};
    if (!f.name.trim()) errs.name = "Product name is required";
    const p = Number(f.price);
    if (!f.price || isNaN(p) || p <= 0) errs.price = "Price must be greater than 0";
    const s = Number(f.stock);
    if (f.stock === "" || isNaN(s) || s < 0 || !Number.isInteger(s)) errs.stock = "Stock must be a whole number ≥ 0";
    if (!f.category) errs.category = "Category is required";
    return errs;
  };

  // Stock dialog
  const [stockOpen, setStockOpen] = useState(false);
  const [stockId, setStockId] = useState<string | null>(null);
  const [stockDelta, setStockDelta] = useState("");
  const [currentStock, setCurrentStock] = useState(0);

  const load = async () => {
    const [p, c] = await Promise.all([
      api.get<ProductsListResponse>("/products"),
      api.get<CategoriesListResponse>("/categories"),
    ]);
    setProducts(p.data.products ?? []);
    setCategories(c.data.categories ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const sorted = useMemo(() => {
    const list = [...products];
    list.sort((a, b) => {
      if (sortKey === "name") {
        return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      const av = sortKey === "price" ? a.price : a.stock;
      const bv = sortKey === "price" ? b.price : b.stock;
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return list;
  }, [products, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  // ── Excel export ───────────────────────────────────────────────
  const exportExcel = () => {
    const rows = sorted.map((p) => ({
      "Product ID": `#${p._id.slice(-8)}`,
      Name: p.name,
      Brand: p.brand || "—",
      Price: `$${p.price.toFixed(2)}`,
      Stock: p.stock,
      Category: typeof p.category === "object" && p.category && "name" in p.category ? p.category.name : String(p.category || "—"),
      "Created At": p.createdAt ? new Date(p.createdAt).toLocaleString() : "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");

    // Auto column widths
    const colWidths = Object.keys(rows[0] ?? {}).map((k) => ({
      wch: Math.max(k.length, ...rows.map((r) => String((r as Record<string,string>)[k] ?? "").length)),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `SmartCart_Products_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ── Create ──────────────────────────────────────────────────────
  const createProduct = async () => {
    const errs = validateForm(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError(null);
      return;
    }
    try {
      await api.post("/products", {
        name: form.name.trim(),
        description: form.description || undefined,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        brand: form.brand || undefined,
        images: form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });
      setCreateOpen(false);
      setForm(emptyForm);
      setError(null);
      setFieldErrors({});
      await load();
    } catch (e: any) {
      const msg = e.response?.data?.message || "Failed to create product";
      setError(msg);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────
  const openEdit = (p: Product) => {
    setEditId(p._id);
    setEditForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      stock: String(p.stock),
      category: typeof p.category === "object" ? p.category._id : (p.category ?? ""),
      brand: p.brand ?? "",
      images: (p.images ?? []).join(", "),
    });
    setError(null);
    setFieldErrors({});
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editId) return;
    const errs = validateForm(editForm);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError(null);
      return;
    }
    try {
      await api.put(`/products/${editId}`, {
        name: editForm.name.trim(),
        description: editForm.description || undefined,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        category: editForm.category,
        brand: editForm.brand || undefined,
        images: editForm.images ? editForm.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });
      setEditOpen(false);
      setEditId(null);
      setError(null);
      setFieldErrors({});
      await load();
    } catch (e: any) {
      const msg = e.response?.data?.message || "Failed to update product";
      setError(msg);
    }
  };

  // ── Stock adjust ────────────────────────────────────────────────
  const openStock = (p: Product) => {
    setStockId(p._id);
    setCurrentStock(p.stock);
    setStockDelta("");
    setStockOpen(true);
  };

  const applyStock = async (direction: "add" | "sub") => {
    if (!stockId) return;
    const delta = Number(stockDelta);
    if (!delta || delta <= 0) return;
    const newStock = direction === "add" ? currentStock + delta : Math.max(0, currentStock - delta);
    await api.put(`/products/${stockId}`, { stock: newStock });
    setStockOpen(false);
    await load();
  };

  // ── Delete ──────────────────────────────────────────────────────
  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    await load();
  };



  return (
    <PageMotion>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage catalog inventory.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={exportExcel}
              disabled={sorted.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            {/* ── Create Dialog ── */}
            <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (v) { setError(null); setFieldErrors({}); setForm(emptyForm); } }}>
              <DialogTrigger render={<Button className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0" />}>
                <Plus className="mr-2 h-4 w-4" />
                New product
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create product</DialogTitle>
              </DialogHeader>
              {error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">{error}</div>}
              <ProductForm
                f={form}
                onChange={(field, val) => { setError(null); setFieldErrors((prev) => ({ ...prev, [field]: undefined })); setForm((prev) => ({ ...prev, [field]: val })); }}
                categories={categories}
                fieldErrors={fieldErrors}
              />
              <DialogFooter>
                <Button
                  onClick={() => void createProduct()}
                  disabled={!form.name || !form.category || !form.price}
                  className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0"
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* ── Edit Dialog ── */}
        <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setError(null); setFieldErrors({}); } }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit product</DialogTitle>
            </DialogHeader>
            {error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">{error}</div>}
            <ProductForm
              f={editForm}
              onChange={(field, val) => { setError(null); setFieldErrors((prev) => ({ ...prev, [field]: undefined })); setEditForm((prev) => ({ ...prev, [field]: val })); }}
              categories={categories}
              fieldErrors={fieldErrors}
            />
            <DialogFooter>
              <Button
                onClick={() => void saveEdit()}
                disabled={!editForm.name || !editForm.category || !editForm.price}
                className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0"
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Stock Dialog ── */}
        <Dialog open={stockOpen} onOpenChange={setStockOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust stock</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Current stock: <strong>{currentStock}</strong>
            </p>
            <div className="space-y-2 py-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min={1}
                value={stockDelta}
                onChange={(e) => setStockDelta(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => void applyStock("sub")}
                disabled={!stockDelta}
              >
                <Minus className="mr-1 h-4 w-4" />
                Remove stock
              </Button>
              <Button
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => void applyStock("add")}
                disabled={!stockDelta}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Sort buttons ── */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleSort("name")} className="gap-1">
            Name
            {sortKey === "name" ? (sortDir === "asc" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />) : null}
          </Button>
          <Button variant="outline" size="sm" onClick={() => toggleSort("price")}>
            Price {sortKey === "price" ? (sortDir === "asc" ? <ArrowDownAZ className="ml-1 h-4 w-4" /> : <ArrowUpAZ className="ml-1 h-4 w-4" />) : null}
          </Button>
          <Button variant="outline" size="sm" onClick={() => toggleSort("stock")}>
            Stock {sortKey === "stock" ? (sortDir === "asc" ? <ArrowDownAZ className="ml-1 h-4 w-4" /> : <ArrowUpAZ className="ml-1 h-4 w-4" />) : null}
          </Button>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-[140px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.brand ?? "—"}</TableCell>
                  <TableCell>${p.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={p.stock === 0 ? "text-destructive font-semibold" : ""}>{p.stock}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Adjust stock"
                        onClick={() => openStock(p)}
                      >
                        <Plus className="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Edit" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Delete" onClick={() => void remove(p._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
