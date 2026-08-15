import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/data/classes", () => ({
  fetchClasses: vi.fn(async () => []),
}));

vi.mock("@/lib/data/pages", () => ({
  fetchPages: vi.fn(async () => [
    {
      slug: "home",
      titleId: "Beranda",
      titleEn: "Home",
      status: "published",
      updatedAt: "2026-08-01T00:00:00Z",
    },
  ]),
}));

vi.mock("@/lib/data/resources", () => ({
  fetchResources: vi.fn(async () => ({
    data: [],
    meta: { page: 1, pageSize: 100, total: 0, totalPages: 1 },
  })),
}));

vi.mock("@/lib/data/prayerGuides", () => ({
  fetchPrayerGuides: vi.fn(async () => [
    {
      id: 1,
      occasion: "Sebelum makan",
      occasionSlug: "sebelum-makan",
      arabicText: "اللَّهُمَّ بَارِكْ لَنَا",
      transliteration: "Allahumma baarik lanaa",
      meaningId: "Ya Allah, berkahilah kami.",
      meaningEn: "O Allah, bless us.",
      sortOrder: 0,
    },
    {
      id: 2,
      occasion: "Sebelum tidur",
      occasionSlug: "sebelum-tidur",
      arabicText: "بِاسْمِكَ اللَّهُمَّ",
      transliteration: "Bismika allahumma",
      meaningId: "Dengan nama-Mu ya Allah.",
      meaningEn: "In Your name, O Allah.",
      sortOrder: 1,
    },
  ]),
}));

import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/seo";

describe("sitemap prayer guide URLs (FND 1.4)", () => {
  it("emits real /doa?occasion= URLs with id/en alternates", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain(`${SITE_URL}/doa?occasion=sebelum-makan`);
    expect(urls).toContain(`${SITE_URL}/doa?occasion=sebelum-tidur`);

    const mealEntry = entries.find((entry) =>
      entry.url.endsWith("/doa?occasion=sebelum-makan"),
    );
    expect(mealEntry?.alternates?.languages).toEqual({
      id: `${SITE_URL}/doa?occasion=sebelum-makan`,
      en: `${SITE_URL}/en/doa?occasion=sebelum-makan`,
    });
  });

  it("no longer emits anchor-style /doa# URLs", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/doa#"))).toBe(false);
  });
});
