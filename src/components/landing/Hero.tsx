import Link from "next/link";
import { localizedHref, type Lang } from "@/lib/lang";

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

          <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
            <svg className="w-full" viewBox="0 0 480 440">
              <defs>
                <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d7f2e4" />
                  <stop offset="1" stopColor="#fdf6e3" />
                </linearGradient>
              </defs>
              <rect x="20" y="20" width="440" height="400" rx="48" fill="url(#hero-sky)" />
              <circle cx="392" cy="86" r="42" fill="#fcd34d" />
              <circle cx="392" cy="86" r="32" fill="#fbbf24" />
              <g fill="#ffffff">
                <path d="M52 96 q14 -12 28 0 q-14 8 -28 0" opacity="0.9" />
                <path d="M96 74 q16 -14 32 0 q-16 9 -32 0" opacity="0.85" />
                <path d="M384 150 q14 -12 28 0 q-14 8 -28 0" opacity="0.8" />
              </g>
              <g fill="#f59e0b">
                <path d="M70 46 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" />
                <path d="M148 40 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" />
                <path d="M410 44 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" />
                <path d="M446 130 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" />
                <path d="M128 130 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" />
              </g>
              <ellipse cx="240" cy="396" rx="180" ry="18" fill="#3aa476" opacity="0.22" />
              <rect x="96" y="330" width="288" height="18" rx="8" fill="#2b8a63" />
              <rect x="112" y="262" width="22" height="76" rx="8" fill="#93d8b4" />
              <rect x="346" y="262" width="22" height="76" rx="8" fill="#93d8b4" />
              <circle cx="123" cy="256" r="15" fill="none" stroke="#2b8a63" strokeWidth="6" />
              <circle cx="357" cy="256" r="15" fill="none" stroke="#2b8a63" strokeWidth="6" />
              <path d="M240 150 Q 152 216 160 322 L 320 322 Q 328 216 240 150 Z" fill="#2b8a63" />
              <path d="M240 178 Q 178 224 186 314 L 294 314 Q 302 224 240 178 Z" fill="#93d8b4" opacity="0.85" />
              <circle cx="240" cy="126" r="17" fill="#d97706" />
              <path d="M240 109 L 246 122 L 260 123 L 249 132 L 252 146 L 240 138 L 228 146 L 231 132 L 220 123 L 234 122 Z" fill="#fbbf24" />
              <rect x="216" y="308" width="48" height="18" rx="6" fill="#205844" />
              <path d="M150 330 Q 150 296 190 296 L 290 296 Q 330 296 330 330 Z" fill="#5cbf8e" opacity="0.5" />
              <g fill="#f9a8d4">
                <circle cx="88" cy="372" r="10" />
                <circle cx="100" cy="362" r="10" />
                <circle cx="112" cy="372" r="10" />
                <circle cx="100" cy="380" r="10" />
                <circle cx="100" cy="371" r="6" fill="#fde047" />
              </g>
              <g fill="#fbbf24">
                <circle cx="374" cy="370" r="11" />
                <circle cx="386" cy="360" r="11" />
                <circle cx="398" cy="370" r="11" />
                <circle cx="386" cy="378" r="11" />
                <circle cx="386" cy="369" r="6.5" fill="#f43f5e" />
              </g>
              <g stroke="#2b8a63" strokeWidth="3" strokeLinecap="round" opacity="0.7">
                <path d="M96 208 q10 -14 20 0" fill="none" />
                <path d="M364 200 q10 -14 20 0" fill="none" />
                <path d="M200 206 q10 -14 20 0" fill="none" />
                <path d="M260 196 q10 -14 20 0" fill="none" />
              </g>
            </svg>
            <span className="animate-floaty absolute -right-2 top-6 rounded-2xl bg-white/95 px-4 py-2 font-display text-sm font-bold text-mint-700 shadow-lg">
              {lang === "en" ? "Love of the Qur'an" : "Cinta Al-Qur&rsquo;an"}
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