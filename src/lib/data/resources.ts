import { USE_MOCK_DATA } from "@/lib/api/client";
import {
  mapCategory,
  mapDownloadResponse,
  mapPaginatedResources,
  mapResourceDetail,
} from "@/lib/api/mappers";
import {
  getCategories as apiGetCategories,
  getResourceBySlug as apiGetResourceBySlug,
  getResources as apiGetResources,
  postResourceDownload as apiPostResourceDownload,
} from "@/lib/api/resources";
import { mockCategories, mockResources } from "@/lib/mock/data";
import type { Paginated } from "@/lib/types/api";
import type {
  Category,
  DownloadResponse,
  ResourceDetail,
  ResourceFilters,
  ResourceSummary,
} from "@/lib/types/resource";

function toSummary(resource: ResourceDetail): ResourceSummary {
  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    category: resource.category,
    ageGroup: resource.ageGroup,
    thumbnailUrl: resource.thumbnailUrl,
    downloadCount: resource.downloadCount,
    publishedAt: resource.publishedAt,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK_DATA) {
    return mockCategories;
  }
  const list = await apiGetCategories();
  return list.map(mapCategory);
}

export async function fetchResources(
  filters: ResourceFilters,
): Promise<Paginated<ResourceSummary>> {
  if (USE_MOCK_DATA) {
    const pageSize = filters.pageSize ?? 12;
    const page = filters.page ?? 1;

    let items = mockResources.map(toSummary);

    if (filters.category && filters.category !== "all") {
      items = items.filter((item) => item.category.slug === filters.category);
    }
    if (filters.ageGroup && filters.ageGroup !== "all") {
      items = items.filter((item) => item.ageGroup === filters.ageGroup);
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q),
      );
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;

    return {
      data: items.slice(start, start + pageSize),
      meta: { page, pageSize, total, totalPages },
    };
  }
  const paginated = await apiGetResources(filters);
  return mapPaginatedResources(paginated);
}

export async function fetchResourceBySlug(
  slug: string,
): Promise<ResourceDetail> {
  if (USE_MOCK_DATA) {
    const resource = mockResources.find((item) => item.slug === slug);
    if (!resource) {
      throw new Error("Materi tidak ditemukan");
    }
    return resource;
  }
  const detail = await apiGetResourceBySlug(slug);
  return mapResourceDetail(detail);
}

export async function requestResourceDownload(
  id: number,
): Promise<DownloadResponse> {
  if (USE_MOCK_DATA) {
    const resource = mockResources.find((item) => item.id === id);
    return {
      downloadUrl: resource?.fileUrl ?? "/samples/sample.pdf",
      fileName: resource?.fileName ?? "materi.pdf",
      expiresInSeconds: 600,
    };
  }
  const response = await apiPostResourceDownload(id);
  return mapDownloadResponse(response);
}
