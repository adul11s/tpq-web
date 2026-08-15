import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContent } from "@/components/landing/PageContent";
import { fetchPageBySlug } from "@/lib/data/pages";
import { isLang, type Lang } from "@/lib/lang";
import { metadataFromPage } from "@/lib/seo";

export const revalidate = 600;

interface PrivacyPolicyPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PrivacyPolicyPageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const page = await fetchPageBySlug("privacy-policy").catch(() => null);
  if (!page) {
    return { title: "Halaman tidak ditemukan" };
  }
  return metadataFromPage(lang, page, "/privacy-policy");
}

export default async function PrivacyPolicyPage({
  params,
}: PrivacyPolicyPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const page = await fetchPageBySlug("privacy-policy").catch(() => null);

  if (!page) {
    notFound();
  }

  const contentBlocks =
    lang === "en" && page.contentEn ? page.contentEn : page.contentId;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        {lang === "en" && page.titleEn ? page.titleEn : page.titleId}
      </h1>
      <div className="mt-6 space-y-5">
        <PageContent blocks={contentBlocks} lang={lang} />
      </div>
    </div>
  );
}
