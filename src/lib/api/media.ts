import { adminFetch } from "./admin-client";
import type { AdminMediaAsset } from "../types/admin";

export interface AdminMediaUpload {
  id: number;
  thumbnail_id?: number;
  storage_key: string;
  mime_type: string;
  file_size: number;
  kind: "pdf" | "image";
}

export interface AdminMediaList {
  media: AdminMediaAsset[];
}

export interface MediaApiError {
  status: number;
  message: string;
}

export function toMediaError(error: unknown): MediaApiError {
  const apiError = error as { status?: number; message?: string };
  return {
    status: apiError.status ?? 0,
    message: apiError.message ?? "Terjadi kesalahan",
  };
}

export const mediaApi = {
  upload(file: File, thumbnail?: File): Promise<AdminMediaUpload> {
    const formData = new FormData();
    formData.append("file", file);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    return adminFetch<AdminMediaUpload>("/admin/media", {
      method: "POST",
      formData,
    });
  },

  list(): Promise<AdminMediaList> {
    return adminFetch<AdminMediaList>("/admin/media");
  },
};
