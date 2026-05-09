import { create } from "zustand";
import type { JwtUser, UserRole } from "@/types";

type AuthState = {
  user: JwtUser | null;
  hydrated: boolean;
  setUser: (user: JwtUser | null) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  hydrate: async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        set({ user: null, hydrated: true });
        return;
      }
      const data = (await res.json()) as { user: { id: string; role: UserRole } | null };
      set({ user: data.user, hydrated: true });
    } catch {
      set({ user: null, hydrated: true });
    }
  },
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    set({ user: null });
  },
}));
