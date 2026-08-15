import { z } from "zod";
import type { ReactNode } from "react";
import type { Role } from "@/lib/types/admin";
import { getCategories } from "@/lib/api/resources";
import { formatTime } from "@/lib/admin/time";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "media"
  | "schedule"
  | "curriculum";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldSpec {
  name: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  loadOptions?: () => Promise<FieldOption[]>;
  slugFrom?: string;
  required: boolean;
  helper?: string;
  mediaKind?: "pdf" | "image" | "all";
  time?: boolean;
}

export interface ListColumn {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => ReactNode;
}

export interface EntityConfig {
  key: string;
  label: string;
  createSchema: z.ZodType;
  fields: FieldSpec[];
  listColumns: ListColumn[];
  roles: Role[];
  publishable: boolean;
  archivable: boolean;
}

export const AGE_GROUP_OPTIONS: FieldOption[] = [
  { value: "paud", label: "PAUD 3\u20134" },
  { value: "tk", label: "TK 5\u20136" },
  { value: "tpa", label: "TPA 7\u201312" },
  { value: "all", label: "Semua" },
];

export const CURRICULUM_ASPECT_OPTIONS: FieldOption[] = [
  { value: "quran_targets", label: "Target Qur'an" },
  { value: "adab", label: "Adab" },
  { value: "academics", label: "Akademik" },
  { value: "life_skills", label: "Kecakapan Hidup" },
];

export const CATEGORY_OPTIONS: FieldOption[] = [
  { value: "1", label: "Doa Harian" },
  { value: "2", label: "Bacaan" },
  { value: "3", label: "Mewarnai" },
  { value: "4", label: "Kaligrafi" },
  { value: "5", label: "Dokumen" },
];

export async function loadCategoryOptions(): Promise<FieldOption[]> {
  const categories = await getCategories();
  return categories.map((category) => ({
    value: String(category.id),
    label: category.name,
  }));
}

export const DAY_OPTIONS: string[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export const DAY_OPTION_LIST: FieldOption[] = DAY_OPTIONS.map((day) => ({
  value: day,
  label: day,
}));

const optionalDigits = z
  .union([z.string().regex(/^\d+(\.\d{1,2})?$/, "Format angka, contoh: 300000"), z.literal("")])
  .optional();

const classCreateSchema = z
  .object({
    code: z
      .string()
      .min(2, "Kode minimal 2 huruf")
      .regex(/^[A-Za-z]+$/, "Kode hanya boleh huruf")
      .transform((code) => code.toUpperCase()),
    name: z.string().min(1, "Nama wajib diisi"),
    name_en: z.string().optional(),
    age_min: z.number().int("Angka bulat").min(0, "Tidak boleh negatif"),
    age_max: z.number().int("Angka bulat").min(0, "Tidak boleh negatif"),
    description: z.string().optional(),
    description_en: z.string().optional(),
    hours: z.string().optional(),
    fees: optionalDigits,
    capacity: z.string().optional(),
  })
  .refine((data) => data.age_max >= data.age_min, {
    message: "Usia maksimal harus sama atau lebih besar dari usia minimal",
    path: ["age_max"],
  });

const scheduleItemCreateSchema = z
  .object({
    class_id: z.number({ error: "Kelas wajib dipilih" }).int().positive("Kelas wajib dipilih"),
    day_name: z.string().min(1, "Hari wajib diisi"),
    start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Waktu mulai format HH:MM"),
    end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Waktu selesai format HH:MM"),
    activity: z.string().min(1, "Kegiatan wajib diisi"),
    sort_order: z.number().int().default(0),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "Waktu selesai harus setelah waktu mulai",
    path: ["end_time"],
  });

const curriculumItemCreateSchema = z.object({
  class_id: z.number({ error: "Kelas wajib dipilih" }).int().positive("Kelas wajib dipilih"),
  aspect: z.enum(["quran_targets", "adab", "academics", "life_skills"], {
    error: "Aspek wajib dipilih",
  }),
  title: z.string().min(1, "Judul wajib diisi"),
  title_en: z.string().optional(),
  description: z.string().optional(),
  description_en: z.string().optional(),
  sort_order: z.number().int().default(0),
});

const resourceCreateSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z
    .union([
      z.string().regex(/^[a-z0-9-]{1,120}$/, "Huruf kecil, angka, dan tanda hubung"),
      z.literal(""),
    ])
    .optional(),
  category_id: z.number({ error: "Kategori wajib dipilih" }).int().positive("Kategori wajib dipilih"),
  age_group: z.enum(["paud", "tk", "tpa", "all"]).default("all"),
  description: z.string().optional(),
  file_media_id: z.number({ error: "ID file wajib diisi" }).int().positive("ID file wajib diisi"),
  thumbnail_media_id: z.number({ error: "ID thumbnail wajib diisi" }).int().positive("ID thumbnail wajib diisi"),
});

const categoryLabel = (row: Record<string, unknown>): string =>
  CATEGORY_OPTIONS.find((option) => option.value === String(row.category_id))?.label ??
  String(row.category_id ?? "");

const ageGroupLabel = (row: Record<string, unknown>): string =>
  AGE_GROUP_OPTIONS.find((option) => option.value === row.age_group)?.label ??
  String(row.age_group ?? "");

const classAgeLabel = (row: Record<string, unknown>): string =>
  `${row.age_min}\u2013${row.age_max} tahun`;

const scheduleTimeLabel = (row: Record<string, unknown>): string =>
  `${formatTime(String(row.start_time ?? ""))}\u2013${formatTime(String(row.end_time ?? ""))}`;

const aspectLabel = (row: Record<string, unknown>): string =>
  CURRICULUM_ASPECT_OPTIONS.find((option) => option.value === row.aspect)?.label ??
  String(row.aspect ?? "");

const classes: EntityConfig = {
  key: "classes",
  label: "Kelas",
  createSchema: classCreateSchema,
  fields: [
    { name: "code", label: "Kode", type: "text", required: true, helper: "2\u201310 huruf, otomatis kapital" },
    { name: "name", label: "Nama", type: "text", required: true },
    { name: "name_en", label: "Nama (EN)", type: "text", required: false },
    { name: "age_min", label: "Usia minimal", type: "number", required: true },
    { name: "age_max", label: "Usia maksimal", type: "number", required: true },
    { name: "hours", label: "Jam belajar", type: "text", required: false },
    { name: "fees", label: "Biaya", type: "text", required: false, helper: "Contoh: 300000" },
    { name: "capacity", label: "Kapasitas", type: "text", required: false },
    { name: "description", label: "Deskripsi", type: "textarea", required: false },
    { name: "description_en", label: "Deskripsi (EN)", type: "textarea", required: false },
    {
      name: "class_schedule_items",
      label: "Jadwal Belajar",
      type: "schedule",
      required: false,
      helper: "Jadwal tampil ke publik saat kelas sudah dipublikasikan",
    },
    { name: "curriculum_items", label: "Kurikulum", type: "curriculum", required: false },
  ],
  listColumns: [
    { key: "code", label: "Kode" },
    { key: "name", label: "Nama" },
    { key: "age", label: "Usia", render: classAgeLabel },
    { key: "hours", label: "Jam belajar" },
  ],
  roles: ["content_manager", "admin"],
  publishable: true,
  archivable: true,
};

const resources: EntityConfig = {
  key: "resources",
  label: "Materi",
  createSchema: resourceCreateSchema,
  fields: [
    { name: "title", label: "Judul", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: false, slugFrom: "title", helper: "Kosongkan untuk otomatis" },
    { name: "category_id", label: "Kategori", type: "select", options: CATEGORY_OPTIONS, loadOptions: loadCategoryOptions, required: true },
    { name: "age_group", label: "Kelompok usia", type: "select", options: AGE_GROUP_OPTIONS, required: true },
    { name: "description", label: "Deskripsi", type: "textarea", required: false },
    { name: "file_media_id", label: "File materi", type: "media", mediaKind: "all", required: true },
    { name: "thumbnail_media_id", label: "Thumbnail", type: "media", mediaKind: "image", required: true },
  ],
  listColumns: [
    { key: "title", label: "Judul" },
    { key: "category_id", label: "Kategori", render: categoryLabel },
    { key: "age_group", label: "Usia", render: ageGroupLabel },
    { key: "download_count", label: "Unduhan" },
  ],
  roles: ["content_manager", "admin"],
  publishable: true,
  archivable: true,
};

const classScheduleItems: EntityConfig = {
  key: "class_schedule_items",
  label: "Jadwal",
  createSchema: scheduleItemCreateSchema,
  fields: [
    { name: "class_id", label: "Kelas ID", type: "number", required: true },
    { name: "day_name", label: "Hari", type: "select", options: DAY_OPTION_LIST, required: true },
    { name: "start_time", label: "Waktu mulai", type: "text", time: true, required: true },
    { name: "end_time", label: "Waktu selesai", type: "text", time: true, required: true },
    { name: "activity", label: "Kegiatan", type: "text", required: true },
    { name: "sort_order", label: "Urutan", type: "number", required: false },
  ],
  listColumns: [
    { key: "day_name", label: "Hari" },
    { key: "time", label: "Waktu", render: scheduleTimeLabel },
    { key: "activity", label: "Kegiatan" },
  ],
  roles: ["content_manager", "admin"],
  publishable: false,
  archivable: false,
};

const curriculumItems: EntityConfig = {
  key: "curriculum_items",
  label: "Kurikulum",
  createSchema: curriculumItemCreateSchema,
  fields: [
    { name: "class_id", label: "Kelas ID", type: "number", required: true },
    { name: "aspect", label: "Aspek", type: "select", options: CURRICULUM_ASPECT_OPTIONS, required: true },
    { name: "title", label: "Judul", type: "text", required: true },
    { name: "title_en", label: "Judul (EN)", type: "text", required: false },
    { name: "description", label: "Deskripsi", type: "textarea", required: false },
    { name: "description_en", label: "Deskripsi (EN)", type: "textarea", required: false },
    { name: "sort_order", label: "Urutan", type: "number", required: false },
  ],
  listColumns: [
    { key: "aspect", label: "Aspek", render: aspectLabel },
    { key: "title", label: "Judul" },
  ],
  roles: ["content_manager", "admin"],
  publishable: false,
  archivable: false,
};

export const ENTITY_CONFIG: Record<string, EntityConfig> = {
  classes,
  resources,
  class_schedule_items: classScheduleItems,
  curriculum_items: curriculumItems,
};
