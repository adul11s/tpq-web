import { apiFetch } from "@/lib/api/client";
import type { ApiPrayerGuide } from "@/lib/api/mappers";

export async function getPrayerGuides(): Promise<ApiPrayerGuide[]> {
  return apiFetch<ApiPrayerGuide[]>("/prayer-guides");
}
