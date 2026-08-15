import { adminFetch } from "@/lib/api/admin-client";
import type { AdminUser } from "@/lib/types/admin";

export const userApi = {
  list(): Promise<{ users: AdminUser[] }> {
    return adminFetch<{ users: AdminUser[] }>("/admin/users");
  },

  reset2fa(id: number): Promise<{ ok: true }> {
    return adminFetch<{ ok: true }>(`/admin/users/${id}/reset-2fa`, {
      method: "POST",
    });
  },

  deactivate(id: number): Promise<{ ok: true }> {
    return adminFetch<{ ok: true }>(`/admin/users/${id}/deactivate`, {
      method: "POST",
    });
  },

  activate(id: number): Promise<{ ok: true }> {
    return adminFetch<{ ok: true }>(`/admin/users/${id}/activate`, {
      method: "POST",
    });
  },
};
