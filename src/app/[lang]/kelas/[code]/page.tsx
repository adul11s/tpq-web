import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchClassByCode } from "@/lib/data/classes";
import { fetchSiteSettings } from "@/lib/data/pages";
import { isLang, localizedHref, pick, type Lang } from "@/lib/lang";
import { waLink } from "@/lib/wa";
import { buildMetadata } from "@/lib/seo";
import { formatTime } from "@/lib/admin/time";
import type { CurriculumAspect } from "@/lib/types/api";

interface ClassDetailPageProps {
  params: Promise<{ lang: string; code: string }>;
}

export const revalidate = 600;

const aspectLabels: Record<CurriculumAspect, { id: string; en: string }> = {
  quran_targets: { id: "Target Al-Qur'an", en: "Qur'an Targets" },
  adab: { id: "Adab & Akhlak", en: "Manners & Character" },
  academics: { id: "Akademik", en: "Academics" },
  life_skills: { id: "Kecakapan Hidup", en: "Life Skills" },
};

export async function generateMetadata({
  params,
}: ClassDetailPageProps): Promise<Metadata> {
  const { lang: langParam, code } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const classDetail = await fetchClassByCode(code).catch(() => null);
  if (!classDetail) {
    return { title: "Kelas tidak ditemukan" };
  }
  return buildMetadata({
    lang,
    path: `/kelas/${classDetail.code.toLowerCase()}`,
    titleId: classDetail.name,
    titleEn: classDetail.nameEn,
    descriptionId: classDetail.description,
    descriptionEn: classDetail.descriptionEn,
  });
}

export default async function ClassDetailPage({
  params,
}: ClassDetailPageProps) {
  const { lang: langParam, code } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const [classDetail, settings] = await Promise.all([
    fetchClassByCode(code).catch(() => null),
    fetchSiteSettings(),
  ]);

  if (!classDetail) {
    notFound();
  }

  const waHref = waLink(
    settings.whatsapp,
    `Assalamu'alaikum, saya ingin mendaftar ${classDetail.name}.`,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href={localizedHref(lang, "/kelas")} className="hover:text-emerald-700">
          {pick(lang, "Program Kelas", "Programs")}
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{classDetail.code}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {pick(lang, classDetail.name, classDetail.nameEn)}
          </h1>
          <p className="mt-2 text-slate-600">
            {pick(lang, classDetail.description, classDetail.descriptionEn)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="emerald">
              {classDetail.ageMin}–{classDetail.ageMax}{" "}
              {pick(lang, "tahun", "years")}
            </Badge>
            {classDetail.hours ? (
              <Badge>
                {pick(lang, "Jam: ", "Hours: ")}
                {classDetail.hours}
              </Badge>
            ) : null}
            {classDetail.capacity ? (
              <Badge>
                {pick(lang, "Kapasitas: ", "Capacity: ")}
                {classDetail.capacity}
              </Badge>
            ) : null}
            {classDetail.fees !== null ? (
              <Badge tone="amber">
                {pick(lang, "SPP: ", "Monthly fee: ")}
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(classDetail.fees)}
                /{pick(lang, "bulan", "mo")}
              </Badge>
            ) : null}
          </div>
        </div>
        <Button href={waHref} target="_blank" rel="noopener noreferrer">
          {pick(lang, "Daftar via WhatsApp", "Enroll via WhatsApp")}
        </Button>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">
          {pick(lang, "Kurikulum", "Curriculum")}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {classDetail.curriculum.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Badge tone="sky">{aspectLabels[item.aspect][lang]}</Badge>
              <h3 className="mt-3 font-semibold text-slate-900">
                {pick(lang, item.title, item.titleEn)}
              </h3>
              {item.description ? (
                <p className="mt-1 text-sm text-slate-600">
                  {pick(lang, item.description, item.descriptionEn)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">
          {pick(lang, "Jadwal Contoh", "Sample Schedule")}
        </h2>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3">
                  {pick(lang, "Hari", "Day")}
                </th>
                <th scope="col" className="px-5 py-3">
                  {pick(lang, "Waktu", "Time")}
                </th>
                <th scope="col" className="px-5 py-3">
                  {pick(lang, "Kegiatan", "Activity")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classDetail.schedule.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {item.dayName}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatTime(item.startTime)}–{formatTime(item.endTime)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{item.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
