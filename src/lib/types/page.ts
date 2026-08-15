import type { ContentStatus } from "@/lib/types/api";

export type PageBlockType =
  | "hero"
  | "heading"
  | "paragraph"
  | "list"
  | "cta"
  | "html";

export interface PageBlock {
  id: string;
  type: PageBlockType;
  text?: string;
  heading?: string;
  items?: string[];
  html?: string;
  ctaHref?: string;
  ctaLabel?: string;
  ctaSecondaryHref?: string;
  ctaSecondaryLabel?: string;
}

export interface Page {
  slug: string;
  titleId: string;
  titleEn: string | null;
  contentId: PageBlock[];
  contentEn: PageBlock[] | null;
  seoTitleId: string | null;
  seoTitleEn: string | null;
  seoDescriptionId: string | null;
  seoDescriptionEn: string | null;
  heroMediaUrl: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  updatedAt: string | null;
}
