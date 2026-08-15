import type { MetadataRoute } from "next";
import { fetchClasses } from "@/lib/data/classes";
import { fetchPages } from "@/lib/data/pages";
import { fetchPrayerGuides } from "@/lib/data/prayerGuides";
import { fetchResources } from "@/lib/data/resources";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, classes, resources, prayerGuides] = await Promise.all([
    fetchPages(),
    fetchClasses(),
    fetchResources({ page: 1, pageSize: 100 }),
    fetchPrayerGuides(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    const path = page.slug === "home" ? "/" : `/${page.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: page.updatedAt ?? undefined,
      alternates: {
        languages: {
          id: `${SITE_URL}${path}`,
          en: `${SITE_URL}/en${path}`,
        },
      },
    });
  }

  for (const classItem of classes) {
    const path = `/kelas/${classItem.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      alternates: {
        languages: {
          id: `${SITE_URL}${path}`,
          en: `${SITE_URL}/en${path}`,
        },
      },
    });
  }

  for (const resource of resources.data) {
    const path = `/resources/${resource.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: resource.publishedAt ?? undefined,
      alternates: {
        languages: {
          id: `${SITE_URL}${path}`,
          en: `${SITE_URL}/en${path}`,
        },
      },
    });
  }

  for (const guide of prayerGuides) {
    entries.push({
      url: `${SITE_URL}/doa?occasion=${guide.occasionSlug}`,
      lastModified: undefined,
      alternates: {
        languages: {
          id: `${SITE_URL}/doa?occasion=${guide.occasionSlug}`,
          en: `${SITE_URL}/en/doa?occasion=${guide.occasionSlug}`,
        },
      },
    });
  }

  return entries;
}
