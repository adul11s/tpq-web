import { USE_MOCK_DATA } from "@/lib/api/client";
import { getClassByCode as apiGetClassByCode, getClasses as apiGetClasses } from "@/lib/api/classes";
import { mapClassDetail, mapClassSummary } from "@/lib/api/mappers";
import { mockClasses } from "@/lib/mock/data";
import type { ClassDetail, ClassSummary } from "@/lib/types/class";

function toSummary(classDetail: ClassDetail): ClassSummary {
  return {
    id: classDetail.id,
    code: classDetail.code,
    slug: classDetail.slug,
    name: classDetail.name,
    nameEn: classDetail.nameEn,
    ageMin: classDetail.ageMin,
    ageMax: classDetail.ageMax,
    description: classDetail.description,
    descriptionEn: classDetail.descriptionEn,
    hours: classDetail.hours,
    capacity: classDetail.capacity,
  };
}

export async function fetchClasses(): Promise<ClassSummary[]> {
  if (USE_MOCK_DATA) {
    return mockClasses.map(toSummary);
  }
  const list = await apiGetClasses();
  return list.map(mapClassSummary);
}

export async function fetchClassDetails(): Promise<ClassDetail[]> {
  const summaries = await fetchClasses();
  const details = await Promise.all(
    summaries.map((item) => fetchClassByCode(item.code).catch(() => null)),
  );
  return details.filter((item): item is ClassDetail => item !== null);
}

export async function fetchClassByCode(code: string): Promise<ClassDetail> {
  if (USE_MOCK_DATA) {
    const classDetail = mockClasses.find(
      (item) => item.code.toLowerCase() === code.toLowerCase(),
    );
    if (!classDetail) {
      throw new Error(`Kelas ${code} tidak ditemukan`);
    }
    return classDetail;
  }
  const detail = await apiGetClassByCode(code);
  return mapClassDetail(detail);
}
