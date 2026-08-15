"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/lang";

type FilterKey = "all" | "makan" | "tidur" | "pagi" | "rumah";

interface DoaCard {
  key: string;
  titleId: string;
  titleEn: string;
  category: Exclude<FilterKey, "all">;
  tint: string;
  arabic: string;
  translit: string;
  meaningId: string;
  meaningEn: string;
  posterHref?: string;
}

const FILTERS: { key: FilterKey; id: string; en: string }[] = [
  { key: "all", id: "Semua Doa", en: "All Prayers" },
  { key: "makan", id: "Makan & Minum", en: "Eating & Drinking" },
  { key: "tidur", id: "Sebelum Tidur", en: "Before Sleep" },
  { key: "pagi", id: "Pagi & Petang", en: "Morning & Evening" },
  { key: "rumah", id: "Masuk & Keluar Rumah", en: "Entering & Leaving Home" },
];

const CARDS: DoaCard[] = [
  {
    key: "doa-sebelum-makan",
    titleId: "Doa Sebelum Makan",
    titleEn: "Prayer Before Eating",
    category: "makan",
    tint: "bg-sky-100 text-sky-700",
    arabic: "اَللّٰهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
    translit: "Allahumma baarik lanaa fiimaa razaqtanaa wa qinaa 'adzaaban-naar",
    meaningId: "\u201cYa Allah, berkahilah rezeki-Mu untuk kami dan jauhkan kami dari siksa neraka.\u201d",
    meaningEn: "\u201cO Allah, bless the provision You gave us and keep us away from the punishment of the Fire.\u201d",
    posterHref: "/content/poster-doa-makan.html",
  },
  {
    key: "doa-sesudah-makan",
    titleId: "Doa Sesudah Makan",
    titleEn: "Prayer After Eating",
    category: "makan",
    tint: "bg-sky-100 text-sky-700",
    arabic: "اَلْحَمْدُ لِلّٰهِ الَّذِيْ اَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِيْنَ",
    translit: "Alhamdu lillaahil-ladzii ath'amanaa wa saqaanaa wa ja'alanaa muslimiin",
    meaningId: "\u201cSegala puji bagi Allah yang memberi kami makan dan minum, serta menjadikan kami Muslim.\u201d",
    meaningEn: "\u201cAll praise is for Allah who fed us and gave us drink, and made us Muslims.\u201d",
    posterHref: "/content/poster-doa-makan.html",
  },
  {
    key: "doa-sebelum-tidur",
    titleId: "Doa Sebelum Tidur",
    titleEn: "Prayer Before Sleeping",
    category: "tidur",
    tint: "bg-violet-100 text-violet-700",
    arabic: "بِاسْمِكَ اللّٰهُمَّ اَحْيَا وَاَمُوْتُ",
    translit: "Bismika Allaahumma ahyaa wa amuut",
    meaningId: "\u201cDengan nama-Mu, ya Allah, aku hidup dan aku mati.\u201d",
    meaningEn: "\u201cIn Your name, O Allah, I live and I die.\u201d",
    posterHref: "/content/poster-doa-tidur.html",
  },
  {
    key: "doa-bangun-tidur",
    titleId: "Doa Bangun Tidur",
    titleEn: "Prayer Upon Waking",
    category: "tidur",
    tint: "bg-violet-100 text-violet-700",
    arabic: "اَلْحَمْدُ لِلّٰهِ الَّذِيْ اَحْيَانَا بَعْدَ مَا اَمَاتَنَا وَاِلَيْهِ النُّشُوْرُ",
    translit: "Alhamdu lillaahil-ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur",
    meaningId: "\u201cSegala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan.\u201d",
    meaningEn: "\u201cAll praise is for Allah who brought us back to life after causing us to die, and to Him is the resurrection.\u201d",
  },
  {
    key: "doa-masuk-kamar-mandi",
    titleId: "Doa Masuk Kamar Mandi",
    titleEn: "Prayer When Entering the Bathroom",
    category: "pagi",
    tint: "bg-gold-100 text-gold-700",
    arabic: "اَللّٰهُمَّ اِنِّيْ اَعُوْذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    translit: "Allaahumma innii a'uudzu bika minal-khubutsi wal-khabaa'its",
    meaningId: "\u201cYa Allah, aku berlindung kepada-Mu dari segala kejahatan laki-laki dan perempuan (jin).\u201d",
    meaningEn: "\u201cO Allah, I seek refuge in You from evil spirits and evil beings (jinn).\u201d",
  },
  {
    key: "doa-keluar-kamar-mandi",
    titleId: "Doa Keluar Kamar Mandi",
    titleEn: "Prayer When Leaving the Bathroom",
    category: "pagi",
    tint: "bg-gold-100 text-gold-700",
    arabic: "غُفْرَانَكَ",
    translit: "Ghufraanaka",
    meaningId: "\u201cAku memohon ampunan-Mu, ya Allah.\u201d",
    meaningEn: "\u201cI seek Your forgiveness, O Allah.\u201d",
  },
  {
    key: "doa-masuk-rumah",
    titleId: "Doa Masuk Rumah",
    titleEn: "Prayer When Entering the Home",
    category: "rumah",
    tint: "bg-mint-100 text-mint-700",
    arabic: "اَللّٰهُمَّ اِنِّيْ اَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ",
    translit: "Allaahumma innii as'aluka khairal-mauliji wa khairal-makhraji",
    meaningId: "\u201cYa Allah, aku memohon kepada-Mu kebaikan tempat masuk dan kebaikan tempat keluar.\u201d",
    meaningEn: "\u201cO Allah, I ask You for the best in entering and the best in leaving.\u201d",
  },
  {
    key: "doa-keluar-rumah",
    titleId: "Doa Keluar Rumah",
    titleEn: "Prayer When Leaving the Home",
    category: "rumah",
    tint: "bg-mint-100 text-mint-700",
    arabic: "بِسْمِ اللّٰهِ تَوَكَّلْتُ عَلَى اللّٰهِ وَلَا حَوْلَ وَلَا قُوَّةَ اِلَّا بِاللّٰهِ",
    translit: "Bismillaahi tawakkaltu 'alallaahi wa laa haula wa laa quwwata illaa billaah",
    meaningId: "\u201cDengan nama Allah aku bertawakal; tiada daya dan kekuatan kecuali dengan Allah.\u201d",
    meaningEn: "\u201cIn Allah's name I place my trust; there is no power and no might except with Allah.\u201d",
  },
];

const FEATURED = CARDS[0];

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path d="M12 3v10m0 0-4-4m4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-1.5-.5 12 12 0 0 1-4.4-3.9 5 5 0 0 1-1-2.7c0-1.2.6-1.8 1-2.2l.5-.5c.2-.2.4-.2.6-.2h.4c.2 0 .4-.1.6.4l.8 1.9c.1.2.1.4 0 .6l-.3.5-.5.5c-.2.2-.3.4-.2.7.2.3.8 1.3 1.6 2.1 1.1 1 2 1.4 2.4 1.5.3.2.5.1.7-.1l1-1.2c.2-.3.4-.3.7-.2l2 1c.3.1.5.2.5.4.1.3.1.8-.2 1.3Z" />
    </svg>
  );
}

export function DoaCatalog({ lang }: { lang: Lang }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [toast, setToast] = useState<{ title: string; href: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const occasion = params.get("occasion");
    if (!occasion) {
      return;
    }
    const match = CARDS.find((card) => card.key === `doa-${occasion}`);
    if (!match) {
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveFilter(match.category);
      const element = document.getElementById(`doa-card-${match.key}`);
      element?.scrollIntoView?.({ block: "center" });
      element?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const share = (titleId: string, titleEn: string, category: string) => {
    const title = lang === "en" ? titleEn : titleId;
    const prefix =
      lang === "en"
        ? "Daily prayer for Muslim children: "
        : "Doa harian anak Muslim: ";
    const href = `https://wa.me/?text=${encodeURIComponent(`${prefix}${title} — TPQ Qur'ani`)}`;
    setToast({ title: `${category}: ${title}`, href });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 6000);
  };

  const visibleCards =
    activeFilter === "all" ? CARDS : CARDS.filter((card) => card.category === activeFilter);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-label={lang === "en" ? "Collection of daily prayers" : "Kumpulan doa harian"}>
        <article className="relative mt-8 overflow-hidden rounded-3xl border border-gold-200 bg-gradient-to-br from-gold-50 via-cream to-mint-50 p-6 shadow-sm sm:p-10">
          <span className="absolute right-4 top-4 rounded-full bg-gold-500 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-on-accent shadow-sm">
            {lang === "en" ? "Prayer of the Day" : "Doa Hari Ini"}
          </span>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-mint-900">
                {lang === "en" ? FEATURED.titleEn : FEATURED.titleId}
              </h2>
              <p className="mt-1 text-xs font-extrabold uppercase tracking-wider text-gold-600">
                {lang === "en" ? FEATURED.titleId : FEATURED.titleEn}
              </p>
              <p lang="ar" dir="rtl" className="font-arabic mt-6 text-3xl leading-relaxed text-mint-900 sm:text-4xl">
                {FEATURED.arabic}
              </p>
              <p className="mt-4 text-sm font-bold italic text-mint-800/70">{FEATURED.translit}</p>
            </div>
            <div>
              <p className="rounded-2xl bg-white/80 px-5 py-4 text-sm leading-relaxed text-mint-900/80 shadow-sm">
                <span className="font-extrabold text-mint-900">
                  {lang === "en" ? "Meaning: " : "Arti: "}
                </span>
                {lang === "en"
                  ? "\u201cO Allah, bless the food You have provided us, and protect us from the punishment of the Fire.\u201d"
                  : "\u201cYa Allah, berkahilah rezeki yang Engkau berikan kepada kami, dan lindungilah kami dari siksa api neraka.\u201d"}
              </p>
              <div className="no-print mt-6 flex flex-wrap gap-3">
                {FEATURED.posterHref ? (
                  <a
                    href={FEATURED.posterHref}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mint-600 px-6 text-sm font-extrabold text-on-primary shadow-md shadow-mint-600/25 transition-colors hover:bg-mint-700"
                  >
                    <DownloadIcon />
                    {lang === "en" ? "Print Poster" : "Cetak Poster"}
                  </a>
                ) : null}
                <button
                  type="button"
                  aria-label={lang === "en" ? `Share ${FEATURED.titleEn}` : `Bagikan ${FEATURED.titleId}`}
                  onClick={() => share(FEATURED.titleId, FEATURED.titleEn, "Doa")}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-mint-300 bg-white px-6 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50"
                >
                  <WhatsAppIcon />
                  {lang === "en" ? "Share" : "Bagikan"}
                </button>
              </div>
            </div>
          </div>
        </article>

        <div
          role="group"
          aria-label={lang === "en" ? "Filter prayers by category" : "Filter kategori doa"}
          className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
        >
          {FILTERS.map((filter) => {
            const active = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveFilter(filter.key)}
                className={
                  active
                    ? "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-mint-600 bg-mint-600 px-4 py-2 text-sm font-extrabold text-white"
                    : "inline-flex min-h-11 shrink-0 items-center rounded-full border border-mint-200 bg-white px-4 py-2 text-sm font-bold text-mint-700 transition-colors hover:bg-mint-50"
                }
              >
                {active ? <CheckIcon /> : null}
                {lang === "en" ? filter.en : filter.id}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCards.map((card) => (
            <article
              key={card.key}
              id={`doa-card-${card.key}`}
              tabIndex={-1}
              className="group flex flex-col rounded-3xl border border-mint-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-mint-900">
                  {lang === "en" ? card.titleEn : card.titleId}
                </h3>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${card.tint}`}>
                  {lang === "en"
                    ? FILTERS.find((f) => f.key === card.category)?.en
                    : FILTERS.find((f) => f.key === card.category)?.id}
                </span>
              </div>
              <p lang="ar" dir="rtl" className="font-arabic mt-3 flex-1 text-2xl leading-relaxed text-mint-900">
                {card.arabic}
              </p>
              <p className="mt-2 text-xs font-bold italic text-mint-800/60">{card.translit}</p>
              <p className="mt-3 border-t border-mint-100 pt-3 text-sm leading-relaxed text-mint-900/75">
                {lang === "en" ? card.meaningEn : card.meaningId}
              </p>
              {card.posterHref ? (
                <a
                  href={card.posterHref}
                  aria-label={`${lang === "en" ? "Print poster" : "Cetak poster"}: ${lang === "en" ? card.titleEn : card.titleId}`}
                  className="no-print mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-mint-300 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50"
                >
                  <DownloadIcon />
                  {lang === "en" ? "Print Poster" : "Cetak Poster"}
                </a>
              ) : (
                <button
                  type="button"
                  aria-label={lang === "en" ? `Share ${card.titleEn}` : `Bagikan ${card.titleId}`}
                  onClick={() => share(card.titleId, card.titleEn, FILTERS.find((f) => f.key === card.category)?.id ?? "")}
                  className="no-print mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-mint-300 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50"
                >
                  <WhatsAppIcon />
                  {lang === "en" ? "Share" : "Bagikan"}
                </button>
              )}
            </article>
          ))}
        </div>

        <p className="no-print mt-10 rounded-2xl border border-mint-100 bg-mint-50 px-5 py-4 text-center text-sm font-bold text-mint-800">
          {lang === "en" ? "Want a print-ready prayer poster? Visit " : "Mau poster doa siap cetak? Kunjungi "}
          <Link href="/content/poster-doa-makan.html" className="text-mint-600 underline underline-offset-2 hover:text-mint-700">
            {lang === "en" ? "Prayer Poster: Meals" : "Poster Doa Makan"}
          </Link>
          {" · "}
          <Link href="/content/poster-doa-tidur.html" className="text-mint-600 underline underline-offset-2 hover:text-mint-700">
            {lang === "en" ? "Prayer Poster: Sleep" : "Poster Doa Tidur"}
          </Link>
          {" · "}
          {lang === "en" ? "or " : "atau "}
          <Link href="/content/asmaul-husna/index.html" className="text-mint-600 underline underline-offset-2 hover:text-mint-700">
            {lang === "en" ? "99 Asmaul Husna Calligraphy" : "99 Kaligrafi Asmaul Husna"}
          </Link>
        </p>
      </section>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
        >
          <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-mint-950 px-4 py-3.5 text-white shadow-2xl">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-500">
              <CheckIcon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold">
                {lang === "en" ? "Thank you!" : "Terima kasih!"}
              </p>
              <p className="truncate text-xs text-mint-300">
                {lang === "en"
                  ? `The link to ${toast.title} is ready to share.`
                  : `Tautan ${toast.title} siap dibagikan.`}
              </p>
            </div>
            <a
              href={toast.href}
              target="_blank"
              rel="noopener"
              className="shrink-0 rounded-lg bg-mint-600 px-3 py-2 text-xs font-extrabold text-white transition-colors hover:bg-mint-700"
            >
              {lang === "en" ? "Open WhatsApp" : "Buka WhatsApp"}
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}