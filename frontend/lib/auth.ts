import type { UserRole } from "@/types";

export function isAdminRole(role: UserRole | string | undefined): boolean {
  return role === "admin";
}
