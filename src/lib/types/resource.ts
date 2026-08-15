import type { AgeGroup, ResourceCategorySlug } from "@/lib/types/api";

export interface Category {
  id: number;
  name: string;
  slug: ResourceCategorySlug;
  description: string | null;
}

export interface ResourceSummary {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  category: Category;
  ageGroup: AgeGroup;
  thumbnailUrl: string;
  downloadCount: number;
  publishedAt: string | null;
}

export interface ResourceDetail extends ResourceSummary {
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string | null;
  previewUrl: string | null;
}

export type AgeFilter = AgeGroup | "all";

export type CategoryFilter = ResourceCategorySlug | "all";

export interface ResourceFilters {
  category?: CategoryFilter;
  ageGroup?: AgeFilter;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface DownloadResponse {
  downloadUrl: string;
  fileName: string;
  expiresInSeconds: number;
}
