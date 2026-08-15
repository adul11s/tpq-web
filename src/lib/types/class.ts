import type { CurriculumAspect } from "@/lib/types/api";

export interface ClassSummary {
  id: number;
  code: string;
  slug: string;
  name: string;
  nameEn: string | null;
  ageMin: number;
  ageMax: number;
  description: string | null;
  descriptionEn: string | null;
  hours: string | null;
  capacity: string | null;
}

export interface CurriculumItem {
  id: number;
  aspect: CurriculumAspect;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  sortOrder: number;
}

export interface ClassScheduleItem {
  id: number;
  dayName: string;
  startTime: string;
  endTime: string;
  activity: string;
  sortOrder: number;
}

export interface ClassDetail extends ClassSummary {
  fees: number | null;
  curriculum: CurriculumItem[];
  schedule: ClassScheduleItem[];
}
