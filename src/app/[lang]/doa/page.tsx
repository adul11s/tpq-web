import type { Metadata } from "next";
import { DoaCatalog } from "@/components/doa/DoaCatalog";
import { isLang, type Lang } from "@/lib/lang";
import { buildMetadata } from "@/lib/seo";

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

function CrescentIcon() {
  return (
    <svg className="h-4 w-4 text-gold-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export default async function PrayerGuidesPage({
  params,
}: PrayerGuidesPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-mint-50 via-cream to-gold-50">
        <div className="star-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="orb animate-floaty -right-24 -top-24 h-72 w-72 bg-mint-200" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 text-center sm:px-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white/80 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-mint-700 shadow-sm">
            <CrescentIcon />
            {lang === "en" ? "Daily Prayers for Muslim Children" : "Doa Harian Anak Muslim"}
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight text-mint-900 sm:text-5xl">
            {lang === "en" ? (
              <>Memorize Your Little One&rsquo;s <span className="text-gold-600">Favorite Prayers</span></>
            ) : (
              <>Hafalkan <span className="text-gold-600">Doa-Doa</span> Kesayangan Ananda</>
            )}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-mint-900/70">
            {lang === "en"
              ? "A collection of daily prayers with Arabic text, transliteration, and meanings — easy to memorize together with your child."
              : "Kumpulan doa harian lengkap dengan tulisan Arab, latin, dan artinya — mudah dihafal dan dihafalkan bersama buah hati."}
          </p>
        </div>
      </section>
      <DoaCatalog lang={lang} />
    </>
  );
}