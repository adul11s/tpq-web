export type ContentStatus = "draft" | "published" | "archived";

export type AgeGroup = "paud" | "tk" | "tpa" | "all";

export type ResourceCategorySlug =
  | "prayers"
  | "readings"
  | "coloring"
  | "calligraphy"
  | "documents";

export type CurriculumAspect =
  | "quran_targets"
  | "adab"
  | "academics"
  | "life_skills";

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  paud: "PAUD (3–4 th)",
  tk: "TK (5–6 th)",
  tpa: "TPA (7–12 th)",
  all: "Semua usia",
};

export const CATEGORY_LABELS: Record<ResourceCategorySlug, string> = {
  prayers: "Doa Harian",
  readings: "Bacaan",
  coloring: "Mewarnai",
  calligraphy: "Kaligrafi",
  documents: "Dokumen",
};
