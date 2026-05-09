"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CategoriesListResponse, Category } from "@/types";
import { PageMotion } from "@/components/PageMotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    const { data } = await api.get<CategoriesListResponse>("/categories");
    setRows(data.categories ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    await api.post("/categories", { name, description: description || undefined });
    setOpen(false);
    setName("");
    setDescription("");
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete category?")) return;
    await api.delete(`/categories/${id}`);
    await load();
  };

  return (
    <PageMotion>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Organize products for browsing.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] border-0"
              onClick={() => setOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New category
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create category</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => void create()} disabled={!name}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.description ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => void remove(c._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
