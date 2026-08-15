import type { Metadata } from "next";
import { pick, type Lang } from "@/lib/lang";
import type { Page } from "@/lib/types/page";

export const SITE_NAME = "TPQ Qur'ani";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tpq-qurani.example.id";

export function publicPath(lang: Lang, path: string): string {
  const cleanPath = path.replace(/^\/en(?=\/|$)/, "") || "/";
  if (lang === "en" && cleanPath !== "/") {
    return `/en${cleanPath}`;
  }
  return cleanPath;
}

interface BuildMetadataArgs {
  lang: Lang;
  path: string;
  titleId: string;
  titleEn?: string | null;
  seoTitleId?: string | null;
  seoTitleEn?: string | null;
  descriptionId?: string | null;
  descriptionEn?: string | null;
  seoDescriptionId?: string | null;
  seoDescriptionEn?: string | null;
  excerpt?: string;
  ogImage?: string;
}

function excerptOf(text: string | null | undefined): string | undefined {
  if (!text) {
    return undefined;
  }
  const plain = text.replace(/\s+/g, " ").trim();
  return plain.length > 155 ? `${plain.slice(0, 152)}…` : plain;
}

export function buildMetadata({
  lang,
  path,
  titleId,
  titleEn,
  seoTitleId,
  seoTitleEn,
  descriptionId,
  descriptionEn,
  seoDescriptionId,
  seoDescriptionEn,
  excerpt,
  ogImage,
}: BuildMetadataArgs): Metadata {
  const title = pick(lang, seoTitleId ?? titleId, seoTitleEn ?? titleEn);
  const seoDescription = pick(
    lang,
    seoDescriptionId ?? descriptionId,
    seoDescriptionEn ?? descriptionEn,
  );
  const description = seoDescription || excerptOf(excerpt);

  const idUrl = new URL(publicPath("id", path), SITE_URL).toString();
  const enUrl = new URL(publicPath("en", path), SITE_URL).toString();

  return {
    title,
    description,
    alternates: {
      canonical: lang === "en" ? enUrl : idUrl,
      languages: {
        id: idUrl,
        en: enUrl,
        "x-default": idUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: lang === "en" ? enUrl : idUrl,
      siteName: SITE_NAME,
      type: "website",
      locale: lang === "en" ? "en_US" : "id_ID",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function metadataFromPage(
  lang: Lang,
  page: Page,
  path: string,
): Metadata {
  const content = lang === "en" && page.contentEn ? page.contentEn : page.contentId;
  return buildMetadata({
    lang,
    path,
    titleId: page.titleId,
    titleEn: page.titleEn,
    seoTitleId: page.seoTitleId,
    seoTitleEn: page.seoTitleEn,
    seoDescriptionId: page.seoDescriptionId,
    seoDescriptionEn: page.seoDescriptionEn,
    descriptionId: undefined,
    descriptionEn: undefined,
    excerpt: firstText(content),
    ogImage: page.heroMediaUrl ?? undefined,
  });
}

export function firstText(
  blocks: Page["contentId"],
): string | undefined {
  for (const block of blocks) {
    if (block.type === "paragraph" && block.text) {
      return block.text;
    }
  }
  return undefined;
}
