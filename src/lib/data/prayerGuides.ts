import { USE_MOCK_DATA } from "@/lib/api/client";
import { mapPrayerGuide } from "@/lib/api/mappers";
import { getPrayerGuides as apiGetPrayerGuides } from "@/lib/api/prayerGuides";
import { mockPrayerGuides } from "@/lib/mock/data";
import type { PrayerGuide } from "@/lib/types/prayerGuide";

export async function fetchPrayerGuides(): Promise<PrayerGuide[]> {
  if (USE_MOCK_DATA) {
    return mockPrayerGuides;
  }
  const list = await apiGetPrayerGuides();
  return list.map(mapPrayerGuide);
}
