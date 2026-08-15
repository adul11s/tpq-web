import { adminFetch } from "./admin-client";
import type { AdminMe } from "../types/admin";

export const adminApi = {
  me: () => adminFetch<AdminMe>("/admin/me"),
  logout: () => adminFetch<{ ok: true }>("/admin/auth/logout", { method: "POST" }),
};
