import { adminFetch } from "@/lib/api/admin-client";
import type { AdminAuditRow } from "@/lib/types/admin";

// Mirrored from api/src/routes/admin/audit.ts (AUDIT_ACTIONS union).
export const AUDIT_ACTIONS = [
  "login_success",
  "login_failure",
  "logout",
  "content_create",
  "content_update",
  "content_publish",
  "content_archive",
  "media_upload",
  "inquiry_status_change",
  "inquiry_export",
  "user_2fa_reset",
  "user_deactivate",
  "user_activate",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  login_success: "Masuk",
  login_failure: "Gagal masuk",
  logout: "Keluar",
  content_create: "Konten dibuat",
  content_update: "Konten diubah",
  content_publish: "Konten diterbitkan",
  content_archive: "Konten diarsipkan",
  media_upload: "Media diunggah",
  inquiry_status_change: "Status pengajuan diubah",
  inquiry_export: "Ekspor pengajuan",
  user_2fa_reset: "2FA direset",
  user_deactivate: "Pengguna dinonaktifkan",
  user_activate: "Pengguna diaktifkan",
};

export interface AuditListParams {
  action?: AuditAction;
  userId?: number;
  page?: number;
  pageSize?: number;
}

export interface AuditListResult {
  data: AdminAuditRow[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
}

export const auditApi = {
  list({
    action,
    userId,
    page = 1,
    pageSize = 50,
  }: AuditListParams = {}): Promise<AuditListResult> {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (userId) params.set("user_id", String(userId));
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    const qs = params.toString();
    return adminFetch<AuditListResult>(`/admin/audit${qs ? `?${qs}` : ""}`);
  },

  exportUrl(): string {
    return "/admin/audit/export.csv";
  },
};
