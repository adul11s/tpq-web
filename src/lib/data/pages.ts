import { USE_MOCK_DATA } from "@/lib/api/client";
import {
  inquiryErrorToApiError,
  postInquiry,
  validateInquiryPayload,
} from "@/lib/api/inquiries";
import { mapPage, mapSiteSettings } from "@/lib/api/mappers";
import { getPageBySlug as apiGetPageBySlug, getPages as apiGetPages } from "@/lib/api/pages";
import { getSiteSettings as apiGetSiteSettings } from "@/lib/api/siteSettings";
import { mockPages, mockSiteSettings } from "@/lib/mock/pages";
import type { InquiryRequest, InquiryResponse } from "@/lib/types/inquiry";
import type { Page } from "@/lib/types/page";
import type { SiteSettings } from "@/lib/types/siteSettings";

export async function fetchPages(): Promise<Page[]> {
  if (USE_MOCK_DATA) {
    return mockPages.filter((page) => page.status === "published");
  }
  const list = await apiGetPages();
  return list.map(mapPage);
}

export async function fetchPageBySlug(slug: string): Promise<Page> {
  if (USE_MOCK_DATA) {
    const page = mockPages.find((item) => item.slug === slug);
    if (!page || page.status !== "published") {
      throw new Error("Halaman tidak ditemukan");
    }
    return page;
  }
  const page = await apiGetPageBySlug(slug);
  return mapPage(page);
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (USE_MOCK_DATA) {
    return mockSiteSettings;
  }
  const settings = await apiGetSiteSettings();
  return mapSiteSettings(settings);
}

export async function submitInquiry(
  payload: InquiryRequest,
): Promise<InquiryResponse> {
  if (USE_MOCK_DATA) {
    const problem = validateInquiryPayload(payload, mockSiteSettings.privacyPolicyVersion);
    if (problem) {
      throw inquiryErrorToApiError(problem);
    }
    return { id: Math.floor(Math.random() * 1000) + 1, message: "Terima kasih! Kami akan segera menghubungi Anda." };
  }
  return postInquiry(payload);
}
