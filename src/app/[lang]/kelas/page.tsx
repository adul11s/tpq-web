import type { Metadata } from "next";
import { KelasTabs } from "@/components/landing/KelasTabs";
import { isLang, type Lang } from "@/lib/lang";
import { buildMetadata } from "@/lib/seo";

interface KelasPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: KelasPageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  return buildMetadata({
    lang,
    path: "/kelas",
    titleId: "Profil Kelas",
    titleEn: "Class Profiles",
    descriptionId:
      "PAUD, TK, dan TPA Qur'ani: kurikulum tahsin, tahfizh, dan adab sesuai tahap usia anak.",
    descriptionEn:
      "PAUD, TK, and TPA Qur'ani: tahsin, memorization, and manners curriculum adapted to each age stage.",
  });
}

function StarIcon() {
  return (
    <svg className="h-4 w-4 text-gold-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6Z" />
    </svg>
  );
}

export default async function KelasPage({ params }: KelasPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-mint-50 via-cream to-gold-50">
        <div className="star-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="orb animate-floaty -right-24 -top-24 h-72 w-72 bg-mint-200" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 text-center sm:px-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white/80 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-mint-700 shadow-sm">
            <StarIcon />
            {lang === "en" ? "Class Profiles" : "Profil Kelas"}
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight text-mint-900 sm:text-5xl">
            {lang === "en" ? (
              <>Learning That Matches <span className="text-gold-600">Your Child&rsquo;s Age</span></>
            ) : (
              <>Belajar Sesuai <span className="text-gold-600">Tahap Usia</span> Ananda</>
            )}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-mint-900/70">
            {lang === "en"
              ? "Three class levels with a progressive Qur'ani curriculum — from first letters to memorizing Juz 30."
              : "Tiga jenjang kelas dengan kurikulum Qur'ani yang bertahap — dari mengenal huruf hingga menghafal Juz 30."}
          </p>
        </div>
      </section>
      <KelasTabs lang={lang} />
    </>
  );
}