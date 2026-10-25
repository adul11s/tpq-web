import Link from "next/link";
import { localizedHref, type Lang } from "@/lib/lang";
import { HeroPhoto } from "@/components/illustrations/PhotoScenes";

interface HeroProps {
  lang: Lang;
}

function StarIcon() {
  return (
    <svg className="h-4 w-4 text-gold-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

export function Hero({ lang }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-mint-50 via-cream to-gold-50">
      <div className="star-pattern absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="orb animate-floaty -left-24 -top-28 h-72 w-72 bg-mint-200" aria-hidden="true" />
      <div
        className="orb animate-floaty -right-20 top-10 h-80 w-80 bg-gold-100"
        style={{ animationDelay: "-3s" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white/80 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-mint-700 shadow-sm">
              <StarIcon />
              PAUD &middot; TK &middot; TPA Qur&rsquo;ani
            </p>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-mint-900 sm:text-5xl">
              {lang === "en" ? (
                <>Assalamu&rsquo;alaikum, <span className="text-gold-600">Dear Parents!</span></>
              ) : (
                <>Assalamu&rsquo;alaikum, <span className="text-gold-600">Ayah &amp; Bunda!</span></>
              )}
            </h1>
            <p
              lang="ar"
              dir="rtl"
              className="font-arabic mx-auto mt-4 max-w-lg text-[1.35rem] leading-relaxed text-mint-800/80 lg:mx-0"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-mint-900/70 lg:mx-0">
              {lang === "en"
                ? "Where your child learns to read the Qur'an, memorize daily prayers, and grow in noble character — through joyful, colorful, and loving learning."
                : "Tempat ananda belajar membaca Al-Qur'an, menghafal doa harian, dan tumbuh berakhlak mulia — melalui belajar yang menyenangkan, penuh warna, dan kasih sayang."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href={localizedHref(lang, "/kontak")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-extrabold text-on-primary shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover"
              >
                {lang === "en" ? "Enroll Now" : "Daftar Sekarang"}
                <ArrowIcon />
              </Link>
              <Link
                href={localizedHref(lang, "/resources")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-mint-300 bg-white px-7 py-3 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50"
              >
                {lang === "en" ? "View Free Materials" : "Lihat Materi Gratis"}
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <dt className="font-display text-2xl font-extrabold text-mint-600 sm:text-3xl">10+</dt>
                <dd className="mt-1 text-xs font-bold text-mint-800/70">
                  {lang === "en" ? "Years of Service" : "Tahun Mengabdi"}
                </dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-extrabold text-mint-600 sm:text-3xl">120+</dt>
                <dd className="mt-1 text-xs font-bold text-mint-800/70">
                  {lang === "en" ? "Active Students" : "Santri Aktif"}
                </dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-extrabold text-gold-600 sm:text-3xl">99</dt>
                <dd className="mt-1 text-xs font-bold text-mint-800/70">Asmaul Husna</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <HeroPhoto />
            <span className="animate-floaty absolute -right-2 top-6 rounded-2xl bg-white/95 px-4 py-2 font-display text-sm font-bold text-mint-700 shadow-lg">
              {lang === "en" ? "Love of the Qur'an" : "Cinta Al-Qur’an"}
            </span>
            <span
              className="animate-floaty absolute -left-2 bottom-16 rounded-2xl bg-gold-100 px-4 py-2 font-display text-sm font-bold text-gold-700 shadow-lg"
              style={{ animationDelay: "-2.5s" }}
            >
              {lang === "en" ? "Learning Through Play" : "Belajar Sambil Bermain"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}