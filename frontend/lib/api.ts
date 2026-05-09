import axios, { type AxiosError } from "axios";
import type { ApiErrorBody } from "@/types";

export const api = axios.create({
  baseURL: "/api/proxy",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/signup") && !path.startsWith("/admin/login")) {
        const next = encodeURIComponent(path + window.location.search);
        window.location.href = `/login?expired=1&next=${next}`;
      }
    }
    return Promise.reject(error);
  }
);
