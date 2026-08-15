import type { Metadata } from "next";
import { ResourcesDashboard } from "@/components/resources/ResourcesDashboard";
import { isLang, type Lang } from "@/lib/lang";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

interface ResourcesPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: ResourcesPageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  return buildMetadata({
    lang,
    path: "/resources",
    titleId: "Materi & Unduhan",
    titleEn: "Downloads & Materials",
    descriptionId:
      "Doa harian, bacaan, lembar mewarnai, dan kaligrafi untuk menemani belajar anak di rumah.",
    descriptionEn:
      "Daily prayers, readings, coloring pages, and calligraphy to support learning at home.",
  });
}

export default async function ResourcesPage({ params }: ResourcesPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  return <ResourcesDashboard lang={lang} />;
}
