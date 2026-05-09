import { create } from "zustand";
import { api } from "@/lib/api";
import type { Cart, Order } from "@/types";

type CartState = {
  cart: Cart | null;
  loading: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  /** PATCH checks availability; POST adds line (stock decreases when admin sets order to Processing) */
  addToCart: (productId: string) => Promise<void>;
  removeLine: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  placeOrder: () => Promise<Order>;
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get<{ success: boolean; cart: Cart }>("/cart");
      set({ cart: data.cart });
    } catch {
      set({ cart: null });
    } finally {
      set({ loading: false });
    }
  },
  addToCart: async (productId, quantity = 1) => {
    await api.patch(`/products/${productId}/cart`);
    await api.post("/cart", { productId, quantity });
    await get().fetchCart();
  },
  removeLine: async (productId) => {
    await api.delete(`/cart/${productId}`);
    await get().fetchCart();
  },
  clearCart: async () => {
    await api.delete("/cart");
    await get().fetchCart();
  },
  placeOrder: async () => {
    const { data } = await api.post<{ success: boolean; order: Order }>("/orders");
    await get().fetchCart();
    return data.order;
  },
}));
