"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { User, UsersListResponse } from "@/types";
import { PageMotion } from "@/components/PageMotion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [sortName, setSortName] = useState<"asc" | "desc">("asc");

  const load = async () => {
    const { data } = await api.get<UsersListResponse>("/users");
    setUsers(data.users ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const sorted = useMemo(() => {
    const list = [...users];
    list.sort((a, b) =>
      sortName === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    return list;
  }, [users, sortName]);

  const remove = async (id: string) => {
    if (!confirm("Delete user?")) return;
    await api.delete(`/users/${id}`);
    await load();
  };

  return (
    <PageMotion>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Customer and staff accounts.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSortName((s) => (s === "asc" ? "desc" : "asc"))}>
            Sort name {sortName === "asc" ? <ArrowUpAZ className="ml-1 h-4 w-4" /> : <ArrowDownAZ className="ml-1 h-4 w-4" />}
          </Button>
        </div>

        <div className="rounded-xl border border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={u.role === "admin"}
                      onClick={() => void remove(u._id)}
                    >
                      Delete
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
