import type { ClassDetail, ClassScheduleItem, ClassSummary, CurriculumItem } from "@/lib/types/class";
import type { Page, PageBlock } from "@/lib/types/page";
import type { PrayerGuide } from "@/lib/types/prayerGuide";
import type { Paginated } from "@/lib/types/api";
import type {
  Category,
  DownloadResponse,
  ResourceDetail,
  ResourceSummary,
} from "@/lib/types/resource";
import type { SiteSettings } from "@/lib/types/siteSettings";

interface ApiClassSummary {
  id: number;
  code: string;
  name: string;
  name_en: string | null;
  age_min: number;
  age_max: number;
  description: string | null;
  description_en: string | null;
  hours: string | null;
  capacity: string | null;
}

interface ApiCurriculumItem {
  aspect: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  sort_order: number;
}

interface ApiScheduleItem {
  day_name: string;
  start_time: string;
  end_time: string;
  activity: string;
}

interface ApiClassDetail extends ApiClassSummary {
  fees: string | null;
  curriculum: ApiCurriculumItem[];
  schedule: ApiScheduleItem[];
}

interface ApiCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

interface ApiResourceSummary {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  category: ApiCategory;
  age_group: string;
  thumbnail_url: string;
  download_count: number;
  published_at: string | null;
}

interface ApiResourceDetail extends ApiResourceSummary {
  file_url: string | null;
  preview_url: string | null;
  file_name: string;
  file_size: number;
  mime_type: string;
}

interface ApiPaginated<T> {
  data: T[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

interface ApiPage {
  slug: string;
  title_id: string;
  title_en: string | null;
  content_id: string | unknown[];
  content_en: string | unknown[] | null;
  seo_title_id: string | null;
  seo_title_en: string | null;
  seo_description_id: string | null;
  seo_description_en: string | null;
}

interface ApiPrayerGuide {
  id: number;
  occasion: string;
  occasion_slug: string;
  arabic_text: string;
  transliteration: string;
  meaning_id: string;
  meaning_en: string | null;
  sort_order: number;
}

interface ApiSiteSettings {
  address: string | null;
  map_link: string | null;
  phone: string | null;
  whatsapp: string | null;
  hours: string | null;
  facebook: string | null;
  instagram: string | null;
  privacy_policy_url: string | null;
  privacy_policy_version: string | null;
}

interface ApiDownloadResponse {
  download_url: string;
  file_name: string;
  expires_in_seconds: number;
}

export type {
  ApiCategory,
  ApiClassDetail,
  ApiClassSummary,
  ApiDownloadResponse,
  ApiPage,
  ApiPaginated,
  ApiPrayerGuide,
  ApiResourceDetail,
  ApiResourceSummary,
  ApiSiteSettings,
};

export function mapClassSummary(api: ApiClassSummary): ClassSummary {
  return {
    id: api.id,
    code: api.code,
    slug: api.code.toLowerCase(),
    name: api.name,
    nameEn: api.name_en,
    ageMin: api.age_min,
    ageMax: api.age_max,
    description: api.description,
    descriptionEn: api.description_en,
    hours: api.hours,
    capacity: api.capacity,
  };
}

export function mapClassDetail(api: ApiClassDetail): ClassDetail {
  const curriculum: CurriculumItem[] = api.curriculum.map((item, index) => ({
    id: index + 1,
    aspect: item.aspect as CurriculumItem["aspect"],
    title: item.title,
    titleEn: item.title_en,
    description: item.description,
    descriptionEn: item.description_en,
    sortOrder: item.sort_order,
  }));
  const schedule: ClassScheduleItem[] = api.schedule.map((item, index) => ({
    id: index + 1,
    dayName: item.day_name,
    startTime: item.start_time,
    endTime: item.end_time,
    activity: item.activity,
    sortOrder: index,
  }));
  return {
    ...mapClassSummary(api),
    fees: api.fees != null ? Number(api.fees) : null,
    curriculum,
    schedule,
  };
}

export function mapCategory(api: ApiCategory): Category {
  return {
    id: api.id,
    slug: api.slug as Category["slug"],
    name: api.name,
    description: api.description,
  };
}

export function mapResourceSummary(api: ApiResourceSummary): ResourceSummary {
  return {
    id: api.id,
    slug: api.slug,
    title: api.title,
    description: api.description,
    category: mapCategory(api.category),
    ageGroup: api.age_group as ResourceSummary["ageGroup"],
    thumbnailUrl: api.thumbnail_url,
    downloadCount: api.download_count,
    publishedAt: api.published_at,
  };
}

export function mapResourceDetail(api: ApiResourceDetail): ResourceDetail {
  return {
    ...mapResourceSummary(api),
    fileName: api.file_name,
    fileSize: api.file_size,
    mimeType: api.mime_type,
    fileUrl: api.file_url,
    previewUrl: api.preview_url,
  };
}

export function mapPaginatedResources(
  api: ApiPaginated<ApiResourceSummary>,
): Paginated<ResourceSummary> {
  return {
    data: api.data.map(mapResourceSummary),
    meta: {
      page: api.meta.page,
      pageSize: api.meta.page_size,
      total: api.meta.total,
      totalPages: api.meta.total_pages,
    },
  };
}

function toBlock(value: unknown, fallback: PageBlock[]): PageBlock[] {
  if (Array.isArray(value)) {
    return value as PageBlock[];
  }
  if (typeof value === "string" && value.trim()) {
    return [{ id: "content", type: "html", html: value }];
  }
  return fallback;
}

export function mapPage(api: ApiPage): Page {
  const contentId = toBlock(api.content_id, []);
  const contentEn = api.content_en != null ? toBlock(api.content_en, contentId) : null;
  return {
    slug: api.slug,
    titleId: api.title_id,
    titleEn: api.title_en,
    contentId,
    contentEn,
    seoTitleId: api.seo_title_id,
    seoTitleEn: api.seo_title_en,
    seoDescriptionId: api.seo_description_id,
    seoDescriptionEn: api.seo_description_en,
    heroMediaUrl: null,
    status: "published",
    publishedAt: null,
    updatedAt: null,
  };
}

export function mapPrayerGuide(api: ApiPrayerGuide): PrayerGuide {
  return {
    id: api.id,
    occasion: api.occasion,
    occasionSlug: api.occasion_slug,
    arabicText: api.arabic_text,
    transliteration: api.transliteration,
    meaningId: api.meaning_id,
    meaningEn: api.meaning_en,
    sortOrder: api.sort_order,
  };
}

export function mapSiteSettings(api: ApiSiteSettings): SiteSettings {
  return {
    address: api.address ?? "",
    mapLink: api.map_link,
    phone: api.phone ?? "",
    whatsapp: api.whatsapp ?? "",
    hours: api.hours ?? "",
    facebook: api.facebook,
    instagram: api.instagram,
    privacyPolicyUrl: api.privacy_policy_url ?? "/privacy-policy",
    privacyPolicyVersion: api.privacy_policy_version ?? "1.0",
  };
}

export function mapDownloadResponse(api: ApiDownloadResponse): DownloadResponse {
  return {
    downloadUrl: api.download_url,
    fileName: api.file_name,
    expiresInSeconds: api.expires_in_seconds,
  };
}
