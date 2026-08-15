import type { Metadata } from "next";
import { ClassCard } from "@/components/landing/ClassCard";
import { Hero } from "@/components/landing/Hero";
import { OrganizationJsonLd } from "@/components/landing/OrganizationJsonLd";
import { fetchClasses } from "@/lib/data/classes";
import { fetchPageBySlug, fetchSiteSettings } from "@/lib/data/pages";
import { isLang, localizedHref, type Lang } from "@/lib/lang";
import { metadataFromPage } from "@/lib/seo";
import { CATEGORY_LABELS } from "@/lib/types/api";

export const revalidate = 600;

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const page = await fetchPageBySlug("home");
  return metadataFromPage(lang, page, "/");
}

const VALUES: {
  icon: React.ReactNode;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  tile: string;
}[] = [
  {
    tile: "bg-mint-100 text-mint-600",
    title: "Tahsin & Tahfizh",
    titleEn: "Tahsin & Memorization",
    body: "Membaca Al-Qur'an dengan tajwid yang benar dan hafalan surat pendek.",
    bodyEn: "Reading the Qur'an with correct tajwid and memorizing short surahs.",
    icon: (
      <>
        <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2Z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
  },
  {
    tile: "bg-gold-100 text-gold-600",
    title: "Akhlak Mulia",
    titleEn: "Noble Character",
    body: "Menanamkan adab, kemandirian, dan kasih sayang sejak usia dini.",
    bodyEn: "Instilling adab, independence, and compassion from an early age.",
    icon: (
      <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6Z" />
    ),
  },
  {
    tile: "bg-sky-100 text-sky-600",
    title: "Belajar Sambil Bermain",
    titleEn: "Learning Through Play",
    body: "Metode fun learning: mewarnai, bernyanyi, dan permainan edukatif.",
    bodyEn: "Fun learning: coloring, singing, and educational games.",
    icon: (
      <>
        <path d="M12 2a7 7 0 0 0-7 7c0 5 4 8 7 13 3-5 7-8 7-13a7 7 0 0 0-7-7Z" />
        <path d="M12 6v6M9 9h6" />
      </>
    ),
  },
  {
    tile: "bg-rose-100 text-rose-500",
    title: "Bimbingan Ustadz/Ustadzah",
    titleEn: "Guidance from Ustadz/Ustadzah",
    body: "Pengajar ramah dan sabar, memahami kebutuhan setiap anak.",
    bodyEn: "Friendly, patient teachers who understand every child's needs.",
    icon: (
      <>
        <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" />
        <path d="M9 10h6M9 14h4" />
      </>
    ),
  },
];

const DOWNLOAD_TILES: {
  slug: keyof typeof CATEGORY_LABELS;
  count: string;
  countEn: string;
  tile: string;
  icon: React.ReactNode;
}[] = [
  {
    slug: "prayers",
    count: "20+ materi",
    countEn: "20+ items",
    tile: "bg-sky-100 text-sky-600",
    icon: <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" />,
  },
  {
    slug: "readings",
    count: "15+ materi",
    countEn: "15+ items",
    tile: "bg-violet-100 text-violet-600",
    icon: (
      <>
        <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2Z" />
        <path d="M9 7h6M9 11h6" />
      </>
    ),
  },
  {
    slug: "coloring",
    count: "25+ lembar",
    countEn: "25+ sheets",
    tile: "bg-rose-100 text-rose-500",
    icon: (
      <>
        <path d="M12 2a7 7 0 0 0-7 7c0 5 4 8 7 13 3-5 7-8 7-13a7 7 0 0 0-7-7Z" />
        <circle cx="9" cy="8" r="1" fill="currentColor" />
        <circle cx="12" cy="5.5" r="1" fill="currentColor" />
        <circle cx="15" cy="8" r="1" fill="currentColor" />
      </>
    ),
  },
  {
    slug: "calligraphy",
    count: "10+ lembar",
    countEn: "10+ sheets",
    tile: "bg-gold-100 text-gold-600",
    icon: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </>
    ),
  },
  {
    slug: "documents",
    count: "Formulir & info",
    countEn: "Forms & info",
    tile: "bg-mint-100 text-mint-600",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
      </>
    ),
  },
];

const TESTIMONIALS: {
  initials: string;
  avatar: string;
  name: string;
  role: string;
  roleEn: string;
  quote: string;
  quoteEn: string;
}[] = [
  {
    initials: "RS",
    avatar: "bg-mint-100 text-mint-700",
    name: "Bu Rina",
    role: "Wali santri TK",
    roleEn: "TK parent",
    quote:
      "Anak saya jadi hafal doa sebelum makan dalam dua minggu. Poster doanya kami tempel di ruang makan dan dia bangga membacanya sendiri!",
    quoteEn:
      "My child memorized the before-meals prayer within two weeks. We pinned the prayer poster on our dining wall and she proudly reads it herself!",
  },
  {
    initials: "AW",
    avatar: "bg-gold-100 text-gold-700",
    name: "Pak Andi",
    role: "Wali santri PAUD",
    roleEn: "PAUD parent",
    quote:
      "Ustadzahnya sabar sekali. Lembar mewarnai hijaiyah dari situs ini dipakai setiap akhir pekan di rumah. Anak selalu minta lagi.",
    quoteEn:
      "The ustadzah is so patient. The hijaiyah coloring sheets from this site are used every weekend at home. Our child always asks for more.",
  },
  {
    initials: "MH",
    avatar: "bg-violet-100 text-violet-700",
    name: "Bu Maya",
    role: "Wali santri TPA",
    roleEn: "TPA parent",
    quote:
      "Metode belajarnya menyenangkan, anak tidak merasa dipaksa. Hafalan Juz 30 anak saya bertambah cepat sejak masuk TPA.",
    quoteEn:
      "The learning method is fun — our child never feels forced. His Juz 30 memorization has grown fast since joining TPA.",
  },
];

function StarRow() {
  return (
    <div className="flex gap-0.5 text-gold-500" aria-label="5 dari 5 bintang">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6Z" />
        </svg>
      ))}
    </div>
  );
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const [classes, settings] = await Promise.all([
    fetchClasses(),
    fetchSiteSettings(),
  ]);

  return (
    <>
      <Hero lang={lang} />
      <OrganizationJsonLd settings={settings} />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="values-heading">
        <div className="text-center">
          <h2 id="values-heading" className="font-display text-2xl font-extrabold text-mint-900 sm:text-3xl">
            {lang === "en" ? "Why Choose TPQ Qur'ani?" : "Mengapa Memilih TPQ Qur'ani?"}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-mint-800/70">
            {lang === "en"
              ? "Qur'an-based education in a warm, cheerful, motivating atmosphere."
              : "Pendidikan berbasis Al-Qur'an dalam suasana yang hangat, ceria, dan penuh motivasi."}
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-3xl border border-mint-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${value.tile}`}>
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  {value.icon}
                </svg>
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-mint-900">
                {lang === "en" ? value.titleEn : value.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-mint-800/70">
                {lang === "en" ? value.bodyEn : value.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="classes-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="classes-heading" className="font-display text-2xl font-extrabold text-mint-900 sm:text-3xl">
              {lang === "en" ? "Learning Programs" : "Program Belajar"}
            </h2>
            <p className="mt-2 text-sm font-semibold text-mint-800/70">
              {lang === "en"
                ? "Each age stage has an adapted learning approach."
                : "Setiap tahap usia memiliki pendekatan belajar yang disesuaikan."}
            </p>
          </div>
          <a
            href={localizedHref(lang, "/kelas")}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-mint-300 bg-white px-5 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50"
          >
            {lang === "en" ? "View All Class Profiles" : "Lihat Semua Profil Kelas"}
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
          </a>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {classes.map((classItem) => (
            <ClassCard key={classItem.code} classItem={classItem} lang={lang} />
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-mint-50 to-gold-50 py-16">
        <div className="star-pattern relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-extrabold text-mint-900 sm:text-3xl">
              {lang === "en" ? "Free Materials & Downloads Center" : "Pusat Materi & Unduhan Gratis"}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-mint-800/70">
              {lang === "en"
                ? "Continue learning at home: daily prayers, readings, coloring pages, and calligraphy ready to download and print."
                : "Lanjutkan belajar di rumah: doa harian, bacaan, lembar mewarnai, dan kaligrafi siap unduh dan cetak."}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DOWNLOAD_TILES.map((tile) => (
              <a
                key={tile.slug}
                href={`${localizedHref(lang, "/resources")}?category=${tile.slug}`}
                className="group rounded-2xl border border-mint-100 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${tile.tile}`}>
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    {tile.icon}
                  </svg>
                </div>
                <span className="mt-3 block font-display text-sm font-bold text-mint-900">
                  {CATEGORY_LABELS[tile.slug]}
                </span>
                <span className="mt-1 block text-xs font-semibold text-mint-800/60">
                  {lang === "en" ? tile.countEn : tile.count}
                </span>
              </a>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href={localizedHref(lang, "/resources")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-extrabold text-on-primary shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover"
            >
              {lang === "en" ? "Open Download Center" : "Buka Pusat Materi"}
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
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="testimonial-heading">
        <div className="text-center">
          <h2 id="testimonial-heading" className="font-display text-2xl font-extrabold text-mint-900 sm:text-3xl">
            {lang === "en" ? "Words from Parents" : "Kata Wali Santri"}
          </h2>
          <p className="mt-2 text-sm font-semibold text-mint-800/70">
            {lang === "en"
              ? "Happy stories from families learning with us."
              : "Cerita bahagia dari keluarga yang belajar bersama kami."}
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure key={item.initials} className="rounded-3xl border border-mint-100 bg-white p-6 shadow-sm">
              <StarRow />
              <blockquote className="mt-3 text-sm leading-relaxed text-mint-900/80">
                &ldquo;{lang === "en" ? item.quoteEn : item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold ${item.avatar}`}
                >
                  {item.initials}
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-mint-900">{item.name}</span>
                  <span className="block text-xs font-semibold text-mint-800/60">
                    {lang === "en" ? item.roleEn : item.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-mint-600 to-mint-800">
        <svg
          className="absolute inset-x-0 top-0 h-10 w-full text-mint-500"
          viewBox="0 0 800 40"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 10 L 60 10 M 80 10 L 150 10 M 170 10 L 240 10 M 260 10 L 330 10 M 350 10 L 420 10 M 440 10 L 510 10 M 530 10 L 600 10 M 620 10 L 690 10 M 710 10 L 800 10"
            stroke="#f59e0b"
            strokeWidth="2"
            fill="none"
            opacity=".7"
          />
          <path d="M0 10 L 30 34 L 60 10 Z" fill="#f59e0b" />
          <path d="M80 10 L 115 34 L 150 10 Z" fill="#fbbf24" />
          <path d="M170 10 L 205 34 L 240 10 Z" fill="#fcd34d" />
          <path d="M260 10 L 295 34 L 330 10 Z" fill="#f59e0b" />
          <path d="M350 10 L 385 34 L 420 10 Z" fill="#fbbf24" />
          <path d="M440 10 L 475 34 L 510 10 Z" fill="#fcd34d" />
          <path d="M530 10 L 565 34 L 600 10 Z" fill="#f59e0b" />
          <path d="M620 10 L 655 34 L 690 10 Z" fill="#fbbf24" />
          <path d="M710 10 L 745 34 L 800 10 Z" fill="#fcd34d" />
        </svg>
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <p lang="ar" dir="rtl" className="font-arabic text-3xl text-gold-200">
            خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
          </p>
          <p className="mt-2 text-sm font-bold italic text-mint-200">
            {lang === "en"
              ? "The best of you are those who learn the Qur'an and teach it. (HR. Bukhari)"
              : "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya. (HR. Bukhari)"}
          </p>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {lang === "en"
              ? "Ready to Start Your Child's Qur'ani Journey?"
              : "Siap Memulai Perjalanan Qur'ani Ananda?"}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-mint-100">
            {lang === "en"
              ? "Places are limited each intake. Consult with us about your child's needs — free and without obligation."
              : "Tempat terbatas setiap angkatan. Konsultasikan kebutuhan ananda dengan kami — gratis dan tanpa kewajiban."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={localizedHref(lang, "/kontak")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold-500 px-7 py-3 text-sm font-extrabold text-on-accent shadow-lg shadow-mint-950/30 transition-colors hover:bg-gold-600"
            >
              {lang === "en" ? "Enroll Now" : "Daftar Sekarang"}
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-extrabold text-white transition-colors hover:bg-white/20"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-1.5-.5 12 12 0 0 1-4.4-3.9 5 5 0 0 1-1-2.7c0-1.2.6-1.8 1-2.2l.5-.5c.2-.2.4-.2.6-.2h.4c.2 0 .4-.1.6.4l.8 1.9c.1.2.1.4 0 .6l-.3.5-.5.5c-.2.2-.3.4-.2.7.2.3.8 1.3 1.6 2.1 1.1 1 2 1.4 2.4 1.5.3.2.5.1.7-.1l1-1.2c.2-.3.4-.3.7-.2l2 1c.3.1.5.2.5.4.1.3.1.8-.2 1.3Z" />
              </svg>
              {lang === "en" ? "Chat on WhatsApp" : "Chat WhatsApp"}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}