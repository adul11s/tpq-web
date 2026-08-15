import { apiFetch } from "@/lib/api/client";
import type {
  ApiCategory,
  ApiDownloadResponse,
  ApiPaginated,
  ApiResourceDetail,
  ApiResourceSummary,
} from "@/lib/api/mappers";
import type { ResourceFilters } from "@/lib/types/resource";

function toQueryString(filters: ResourceFilters): string {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "all") {
    params.set("category", filters.category);
  }
  if (filters.ageGroup && filters.ageGroup !== "all") {
    params.set("age_group", filters.ageGroup);
  }
  if (filters.q) {
    params.set("q", filters.q);
  }
  params.set("page", String(filters.page ?? 1));
  params.set("page_size", String(filters.pageSize ?? 12));
  return params.toString();
}

export async function getCategories(): Promise<ApiCategory[]> {
  return apiFetch<ApiCategory[]>("/categories");
}

export async function getResources(
  filters: ResourceFilters,
): Promise<ApiPaginated<ApiResourceSummary>> {
  const query = toQueryString(filters);
  return apiFetch<ApiPaginated<ApiResourceSummary>>(`/resources?${query}`);
}

export async function getResourceBySlug(
  slug: string,
): Promise<ApiResourceDetail> {
  return apiFetch<ApiResourceDetail>(`/resources/${encodeURIComponent(slug)}`);
}

export async function postResourceDownload(
  id: number,
): Promise<ApiDownloadResponse> {
  return apiFetch<ApiDownloadResponse>(`/resources/${id}/download`, {
    method: "POST",
  });
}
