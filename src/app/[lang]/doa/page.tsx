import type { Metadata } from "next";
import { fetchPrayerGuides } from "@/lib/data/prayerGuides";
import { isLang, pick, type Lang } from "@/lib/lang";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 600;

interface PrayerGuidesPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PrayerGuidesPageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  return buildMetadata({
    lang,
    path: "/doa",
    titleId: "Doa Harian",
    titleEn: "Daily Prayers",
    descriptionId:
      "Kumpulan doa harian untuk anak: sebelum makan, sebelum tidur, dan aktivitas sehari-hari dengan arti.",
    descriptionEn:
      "Daily prayers for children: before meals, before sleep, and daily activities with meanings.",
  });
}

export default async function PrayerGuidesPage({
  params,
}: PrayerGuidesPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const guides = await fetchPrayerGuides();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        {pick(lang, "Doa Harian", "Daily Prayers")}
      </h1>
      <p className="mt-3 text-slate-600">
        {pick(
          lang,
          "Ajak anak menghafal doa sehari-hari. Lafalkan dengan tartil dan pahami artinya bersama-sama.",
          "Help your child memorize daily prayers. Recite with care and learn the meanings together.",
        )}
      </p>

      <div className="mt-10 space-y-6">
        {guides.map((guide) => (
          <article
            key={guide.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900">
              {guide.occasion}
            </h2>
            <p
              dir="rtl"
              lang="ar"
              className="mt-4 text-right font-arabic text-2xl leading-loose text-slate-900 sm:text-3xl"
            >
              {guide.arabicText}
            </p>
            <p className="mt-3 italic text-emerald-800">
              {guide.transliteration}
            </p>
            <p className="mt-2 text-slate-600">
              {pick(lang, guide.meaningId, guide.meaningEn)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
