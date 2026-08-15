import { apiFetch } from "@/lib/api/client";
import type { ApiPage } from "@/lib/api/mappers";

export async function getPages(): Promise<ApiPage[]> {
  return apiFetch<ApiPage[]>("/pages");
}

export async function getPageBySlug(slug: string): Promise<ApiPage> {
  return apiFetch<ApiPage>(`/pages/${encodeURIComponent(slug)}`);
}
