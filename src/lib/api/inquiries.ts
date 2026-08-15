import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/client";
import { adminFetch } from "@/lib/api/admin-client";
import type { InquiryRequest, InquiryResponse } from "@/lib/types/inquiry";
import { PHONE_REGEX } from "@/lib/types/inquiry";
import type { AdminInquiry, InquiryStatus } from "@/lib/types/admin";

export async function postInquiry(
  payload: InquiryRequest,
): Promise<InquiryResponse> {
  return apiFetch<InquiryResponse>("/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function validateInquiryPayload(
  payload: InquiryRequest,
  currentPolicyVersion: string,
): { error: string; fields?: Record<string, string> } | null {
  if (!payload.consent_given) {
    return { error: "Anda harus menyetujui Kebijakan Privasi" };
  }
  if (payload.privacy_policy_version !== currentPolicyVersion) {
    return {
      error: "Kebijakan Privasi telah diperbarui. Mohon tinjau kembali persetujuan Anda.",
      fields: { consent_given: "Kebijakan Privasi telah diperbarui" },
    };
  }
  if (
    typeof payload.parent_name !== "string" ||
    payload.parent_name.trim().length < 2 ||
    payload.parent_name.trim().length > 150
  ) {
    return { error: "Validasi gagal", fields: { parent_name: "Nama harus 2–150 karakter" } };
  }
  if (!PHONE_REGEX.test(payload.phone)) {
    return { error: "Validasi gagal", fields: { phone: "Nomor HP tidak valid" } };
  }
  if (payload.whatsapp && !PHONE_REGEX.test(payload.whatsapp)) {
    return { error: "Validasi gagal", fields: { whatsapp: "Nomor WhatsApp tidak valid" } };
  }
  if (payload.child_age && payload.child_age.length > 30) {
    return { error: "Validasi gagal", fields: { child_age: "Maksimal 30 karakter" } };
  }
  if (payload.message && payload.message.length > 2000) {
    return { error: "Validasi gagal", fields: { message: "Maksimal 2000 karakter" } };
  }
  return null;
}

export function inquiryErrorToApiError(problem: {
  error: string;
  fields?: Record<string, string>;
}): ApiError {
  const error = new ApiError(422, problem.error);
  (error as ApiError & { fields?: Record<string, string> }).fields = problem.fields;
  return error;
}

export interface AdminInquiryUpdateBody {
  status?: InquiryStatus;
  admin_note?: string;
}

export const inquiryAdminApi = {
  list(status?: InquiryStatus): Promise<{ inquiries: AdminInquiry[] }> {
    const query = status !== undefined ? `?status=${status}` : "";
    return adminFetch<{ inquiries: AdminInquiry[] }>(`/admin/inquiries${query}`);
  },

  update(
    id: number,
    body: AdminInquiryUpdateBody
  ): Promise<{ inquiry: AdminInquiry }> {
    return adminFetch<{ inquiry: AdminInquiry }>(`/admin/inquiries/${id}`, {
      method: "PATCH",
      body,
    });
  },

  adminExportUrl(): string {
    return "/admin/inquiries/export.csv";
  },
};
