import type { Metadata } from "next";
import { ClassCard } from "@/components/landing/ClassCard";
import { OrganizationJsonLd } from "@/components/landing/OrganizationJsonLd";
import { PageContent } from "@/components/landing/PageContent";
import { Button } from "@/components/ui/Button";
import { fetchClasses } from "@/lib/data/classes";
import { fetchPageBySlug, fetchSiteSettings } from "@/lib/data/pages";
import { isLang, localizedHref, type Lang } from "@/lib/lang";
import { metadataFromPage } from "@/lib/seo";
import { CATEGORY_LABELS } from "@/lib/types/api";
import type { ResourceCategorySlug } from "@/lib/types/api";

export const revalidate = 600;

const categoryIcons: Record<ResourceCategorySlug, string> = {
  prayers: "🙏",
  readings: "📖",
  coloring: "🖍️",
  calligraphy: "✒️",
  documents: "📄",
};

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const page = await fetchPageBySlug("home");
  return metadataFromPage(lang, page, "/");
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const [page, classes, settings] = await Promise.all([
    fetchPageBySlug("home"),
    fetchClasses(),
    fetchSiteSettings(),
  ]);

  const contentBlocks =
    lang === "en" && page.contentEn ? page.contentEn : page.contentId;
  const bodyBlocks = contentBlocks.filter(
    (block) => block.type !== "hero" && block.type !== "cta",
  );

  return (
    <>
      <PageContent
        blocks={contentBlocks}
        lang={lang}
        allowedTypes={["hero", "html"]}
      />
      <OrganizationJsonLd settings={settings} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PageContent
          blocks={bodyBlocks}
          lang={lang}
          allowedTypes={["heading", "paragraph", "list"]}
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {classes.map((classItem) => (
            <ClassCard key={classItem.code} classItem={classItem} lang={lang} />
          ))}
        </div>
      </section>

      <section className="bg-emerald-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {lang === "en" ? "Download Center" : "Pusat Materi & Unduhan"}
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            {lang === "en"
              ? "Continue learning at home: daily prayers, readings, coloring pages, and calligraphy ready to download and print."
              : "Lanjutkan belajar di rumah: doa harian, bacaan, lembar mewarnai, dan kaligrafi yang siap diunduh dan dicetak."}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
              <div
                key={slug}
                className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
              >
                <span className="text-3xl" aria-hidden="true">
                  {categoryIcons[slug as ResourceCategorySlug]}
                </span>
                <span className="font-semibold text-slate-800">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button href={localizedHref(lang, "/resources")} variant="secondary">
              {lang === "en" ? "Open Download Center" : "Buka Pusat Materi"}
            </Button>
          </div>
        </div>
      </section>

      <PageContent blocks={contentBlocks} lang={lang} allowedTypes={["cta"]} />
    </>
  );
}
