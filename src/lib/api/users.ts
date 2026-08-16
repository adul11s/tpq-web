import { adminFetch } from "@/lib/api/admin-client";
import type { AdminUser } from "@/lib/types/admin";

export interface ProvisionParentInput {
  email: string;
  full_name: string;
  initial_password: string;
}

export interface ProvisionedParent {
  id: number;
  email: string;
  initial_password: string;
  must_change_password: boolean;
}

export const userApi = {
  list(): Promise<{ users: AdminUser[] }> {
    return adminFetch<{ users: AdminUser[] }>("/admin/users");
  },

  provisionParent(input: ProvisionParentInput): Promise<ProvisionedParent> {
    return adminFetch<ProvisionedParent>("/admin/users/parents", {
      method: "POST",
      body: input,
    });
  },

  resetParentPassword(
    id: number,
    newPassword: string
  ): Promise<{ ok: true; must_change_password: boolean }> {
    return adminFetch<{ ok: true; must_change_password: boolean }>(
      `/admin/users/${id}/reset-password`,
      { method: "POST", body: { new_password: newPassword } }
    );
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
