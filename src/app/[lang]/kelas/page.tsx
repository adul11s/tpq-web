import type { Metadata } from "next";
import { ClassCard } from "@/components/landing/ClassCard";
import { fetchClasses } from "@/lib/data/classes";
import { isLang, pick, type Lang } from "@/lib/lang";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 600;

interface ClassesPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: ClassesPageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  return buildMetadata({
    lang,
    path: "/kelas",
    titleId: "Program Kelas",
    titleEn: "Programs",
    descriptionId:
      "Profil program PAUD, TK, dan TPA Qur'ani: usia, jam belajar, biaya, kurikulum, dan jadwal.",
    descriptionEn:
      "Profiles of PAUD, TK, and TPA Qur'ani programs: age, hours, fees, curriculum, and schedule.",
  });
}

export default async function ClassesPage({ params }: ClassesPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const classes = await fetchClasses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        {pick(lang, "Program Kelas", "Programs")}
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        {pick(
          lang,
          "Kenali setiap jenjang program kami — usia, jadwal, kurikulum, dan target pembelajaran.",
          "Get to know each of our program levels — age, schedule, curriculum, and learning targets.",
        )}
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {classes.map((classItem) => (
          <ClassCard key={classItem.code} classItem={classItem} lang={lang} />
        ))}
      </div>
    </div>
  );
}
