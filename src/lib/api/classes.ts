import { apiFetch } from "@/lib/api/client";
import type { ApiClassDetail, ApiClassSummary } from "@/lib/api/mappers";

export async function getClasses(): Promise<ApiClassSummary[]> {
  return apiFetch<ApiClassSummary[]>("/classes");
}

export async function getClassByCode(code: string): Promise<ApiClassDetail> {
  return apiFetch<ApiClassDetail>(`/classes/${encodeURIComponent(code)}`);
}
