import { apiFetch } from "@/lib/api/client";
import type { ApiSiteSettings } from "@/lib/api/mappers";

export async function getSiteSettings(): Promise<ApiSiteSettings> {
  return apiFetch<ApiSiteSettings>("/site-settings");
}
