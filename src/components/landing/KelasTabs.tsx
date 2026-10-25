"use client";

import Link from "next/link";
import { Scene, type SceneKey } from "@/components/illustrations/CartoonScenes";
import { useState } from "react";
import { formatTime } from "@/lib/admin/time";
import { localizedHref, pick, type Lang } from "@/lib/lang";
import { waLink } from "@/lib/wa";
import type { CurriculumAspect } from "@/lib/types/api";
import type { ClassDetail } from "@/lib/types/class";

type TabKey = "paud" | "tk" | "tpa";

interface LearnItem {
  id: string;
  en: string;
  icon: React.ReactNode;
  chip: string;
}

interface ScheduleRow {
  dayId: string;
  dayEn: string;
  time: string;
  activityId: string;
  activityEn: string;
}

interface ProgramData {
  title: string;
  titleEn: string;
  gradient: string;
  badgeLeft: string;
  badgeRight: string;
  scene: SceneKey;
  introId: string;
  introEn: string;
  learnBg: string;
  learnItems: LearnItem[];
  scheduleCaption: string;
  scheduleCaptionEn: string;
  schedule: ScheduleRow[];
  fees: { labelId: string; labelEn: string; valueId: string; valueEn: string }[];
  teacher: { initials: string; avatar: string; name: string; titleId: string; titleEn: string; bioId: string; bioEn: string };
  ctaId: string;
  ctaEn: string;
}

const LEARN_ICONS = {
  check: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),
  heart: (
    <>
      <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 2a7 7 0 0 0-7 7c0 5 4 8 7 13 3-5 7-8 7-13a7 7 0 0 0-7-7Z" />
      <path d="M12 6v6M9 9h6" />
    </>
  ),
  book: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h8" />
    </>
  ),
  star: (
    <>
      <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6Z" />
    </>
  ),
  doc: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M9 13h6M9 17h4" />
    </>
  ),
  mosque: (
    <>
      <path d="M12 3a7 7 0 0 0-7 7v9h14v-9a7 7 0 0 0-7-7Z" />
      <path d="M8 15h8" />
    </>
  ),
};

function iconChip(icon: React.ReactNode, tint: string) {
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ${tint}`}>
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        {icon}
      </svg>
    </span>
  );
}

const PROGRAMS: Record<TabKey, ProgramData> = {
  paud: {
    title: "PAUD",
    titleEn: "PAUD",
    gradient: "from-sky-100 to-mint-100",
    badgeLeft: "bg-primary text-on-primary",
    badgeRight: "bg-white/95 text-sky-700",
    scene: "paud",
    introId:
      "Fondasi pertama perjalanan Qur'ani ananda. Melalui bermain, bernyanyi, dan mewarnai, anak dikenalkan pada huruf hijaiyah, doa-doa pendek harian, dan kebiasaan baik sejak dini.",
    introEn:
      "The first step of your child's Qur'ani journey. Through play, singing, and coloring, children are introduced to hijaiyah letters, short daily prayers, and good habits from an early age.",
    learnBg: "bg-mint-50",
    learnItems: [
      { id: "Mengenal huruf hijaiyah", en: "Recognize hijaiyah letters", chip: "text-mint-700", icon: LEARN_ICONS.check },
      { id: "Doa harian sederhana", en: "Simple daily prayers", chip: "text-gold-700", icon: LEARN_ICONS.heart },
      { id: "Motorik halus (mewarnai, menempel)", en: "Fine motor skills (coloring, pasting)", chip: "text-rose-500", icon: LEARN_ICONS.flower },
      { id: "Adab dan kemandirian", en: "Manners and independence", chip: "text-sky-600", icon: LEARN_ICONS.sparkle },
    ],
    scheduleCaption: "Jadwal kelas PAUD",
    scheduleCaptionEn: "PAUD class schedule",
    schedule: [
      { dayId: "Senin", dayEn: "Monday", time: "08.00–09.00 WIB", activityId: "Hijaiyah & Fun Play", activityEn: "Hijaiyah & Fun Play" },
      { dayId: "Selasa", dayEn: "Tuesday", time: "08.00–09.00 WIB", activityId: "Doa Harian & Hafalan", activityEn: "Daily Prayers & Memorization" },
      { dayId: "Rabu", dayEn: "Wednesday", time: "08.00–09.00 WIB", activityId: "Mewarnai & Keterampilan", activityEn: "Coloring & Crafts" },
      { dayId: "Kamis", dayEn: "Thursday", time: "08.00–09.00 WIB", activityId: "Adab, Kisah & Bermain", activityEn: "Manners, Stories & Play" },
      { dayId: "Jumat", dayEn: "Friday", time: "08.00–09.00 WIB", activityId: "Senam Ceria & Review", activityEn: "Morning Gymnastics & Review" },
    ],
    fees: [
      { labelId: "Pendaftaran", labelEn: "Registration", valueId: "Rp 150.000", valueEn: "Rp 150.000" },
      { labelId: "SPP per bulan", labelEn: "Monthly fee", valueId: "Rp 120.000", valueEn: "Rp 120.000" },
      { labelId: "Buku & media belajar", labelEn: "Books & learning media", valueId: "Gratis", valueEn: "Free" },
    ],
    teacher: {
      initials: "UZ",
      avatar: "bg-sky-100 text-sky-700",
      name: "Ustadzah Zainab",
      titleId: "Guru PAUD · Pengalaman 8 tahun",
      titleEn: "PAUD Teacher · 8 years experience",
      bioId:
        "Lulusan Pendidikan Islam Anak Usia Dini, tersertifikasi tahsin, dan dikenal sabar serta kreatif menghadirkan kelas yang ceria.",
      bioEn:
        "A graduate of Early Childhood Islamic Education, tahsin-certified, and known for her patience and creativity in bringing joyful classes.",
    },
    ctaId: "Daftar ke PAUD Sekarang",
    ctaEn: "Enroll in PAUD Now",
  },
  tk: {
    title: "TK",
    titleEn: "TK",
    gradient: "from-gold-100 to-mint-100",
    badgeLeft: "bg-gold-500 text-on-accent",
    badgeRight: "bg-white/95 text-gold-700",
    scene: "tk",
    introId:
      "Anak mulai membaca Al-Qur'an dengan tahsin awal, menghafal surat-surat pendek, dan menyiapkan kemampuan calistung — tetap melalui kegiatan yang seru dan menyenangkan.",
    introEn:
      "Children begin reading the Qur'an with early tahsin, memorize short surahs, and build early literacy and math skills — all through fun, joyful activities.",
    learnBg: "bg-gold-50",
    learnItems: [
      { id: "Tahsin & baca Al-Qur'an awal", en: "Early tahsin & Qur'an reading", chip: "text-mint-700", icon: LEARN_ICONS.book },
      { id: "Hafalan surat pendek", en: "Memorizing short surahs", chip: "text-gold-700", icon: LEARN_ICONS.star },
      { id: "Calistung (baca-tulis-hitung)", en: "Reading, writing & math (calistung)", chip: "text-sky-600", icon: LEARN_ICONS.doc },
      { id: "Doa harian & praktik ibadah", en: "Daily prayers & worship practice", chip: "text-rose-500", icon: LEARN_ICONS.heart },
    ],
    scheduleCaption: "Jadwal kelas TK",
    scheduleCaptionEn: "TK class schedule",
    schedule: [
      { dayId: "Senin", dayEn: "Monday", time: "08.00–10.00 WIB", activityId: "Tahsin & Iqra", activityEn: "Tahsin & Iqra" },
      { dayId: "Selasa", dayEn: "Tuesday", time: "08.00–10.00 WIB", activityId: "Hafalan & Doa Harian", activityEn: "Memorization & Daily Prayers" },
      { dayId: "Rabu", dayEn: "Wednesday", time: "08.00–10.00 WIB", activityId: "Calistung & Mewarnai", activityEn: "Reading, Writing & Coloring" },
      { dayId: "Kamis", dayEn: "Thursday", time: "08.00–10.00 WIB", activityId: "Adab, Kisah Nabi & Prakarya", activityEn: "Manners, Prophet Stories & Crafts" },
      { dayId: "Jumat", dayEn: "Friday", time: "08.00–09.30 WIB", activityId: "Senam, Shalat Dhuha & Review", activityEn: "Exercise, Duha Prayer & Review" },
    ],
    fees: [
      { labelId: "Pendaftaran", labelEn: "Registration", valueId: "Rp 200.000", valueEn: "Rp 200.000" },
      { labelId: "SPP per bulan", labelEn: "Monthly fee", valueId: "Rp 150.000", valueEn: "Rp 150.000" },
      { labelId: "Buku & media belajar", labelEn: "Books & learning media", valueId: "Gratis", valueEn: "Free" },
    ],
    teacher: {
      initials: "UM",
      avatar: "bg-gold-100 text-gold-700",
      name: "Ustadz Muhammad",
      titleId: "Guru TK · Hafizh 10 Juz",
      titleEn: "TK Teacher · Hafizh of 10 Juz",
      bioId:
        "Hafizh Al-Qur'an, tersertifikasi metode tahsin anak, dan pandai menghadirkan cerita-cerita seru seputar kisah para nabi.",
      bioEn:
        "A hafizh of the Qur'an, certified in children's tahsin methods, and skilled at bringing the stories of the prophets to life.",
    },
    ctaId: "Daftar ke TK Sekarang",
    ctaEn: "Enroll in TK Now",
  },
  tpa: {
    title: "TPA",
    titleEn: "TPA",
    gradient: "from-violet-100 to-mint-100",
    badgeLeft: "bg-violet-600 text-white",
    badgeRight: "bg-white/95 text-violet-700",
    scene: "tpa",
    introId:
      "Anak menamatkan tahsin dengan tajwid yang benar, menghafal Juz 30, dan belajar mempraktikkan ibadah serta adab sehari-hari secara mandiri.",
    introEn:
      "Children complete tahsin with correct tajwid, memorize Juz 30, and learn to practice worship and daily manners independently.",
    learnBg: "bg-violet-50",
    learnItems: [
      { id: "Tahsin & tajwid", en: "Tahsin & tajwid", chip: "text-violet-600", icon: LEARN_ICONS.book },
      { id: "Hafalan Juz 30", en: "Juz 30 memorization", chip: "text-gold-700", icon: LEARN_ICONS.star },
      { id: "Praktik ibadah & adab", en: "Worship practice & manners", chip: "text-sky-600", icon: LEARN_ICONS.mosque },
      { id: "Latihan kepemimpinan & dakwah cilik", en: "Leadership & little da'wah practice", chip: "text-rose-500", icon: LEARN_ICONS.heart },
    ],
    scheduleCaption: "Jadwal kelas TPA",
    scheduleCaptionEn: "TPA class schedule",
    schedule: [
      { dayId: "Senin", dayEn: "Monday", time: "14.00–16.00 WIB", activityId: "Tahsin & Tajwid", activityEn: "Tahsin & Tajwid" },
      { dayId: "Selasa", dayEn: "Tuesday", time: "14.00–16.00 WIB", activityId: "Hafalan Juz 30", activityEn: "Juz 30 Memorization" },
      { dayId: "Rabu", dayEn: "Wednesday", time: "14.00–16.00 WIB", activityId: "Kaligrafi & Keterampilan", activityEn: "Calligraphy & Crafts" },
      { dayId: "Kamis", dayEn: "Thursday", time: "14.00–16.00 WIB", activityId: "Fiqih Ibadah & Sirah", activityEn: "Fiqh of Worship & Sirah" },
      { dayId: "Jumat", dayEn: "Friday", time: "15.00–17.00 WIB", activityId: "Latihan Dakwah Cilik & Review", activityEn: "Little Da'wah Practice & Review" },
    ],
    fees: [
      { labelId: "Pendaftaran", labelEn: "Registration", valueId: "Rp 200.000", valueEn: "Rp 200.000" },
      { labelId: "SPP per bulan", labelEn: "Monthly fee", valueId: "Rp 100.000", valueEn: "Rp 100.000" },
      { labelId: "Buku & media belajar", labelEn: "Books & learning media", valueId: "Gratis", valueEn: "Free" },
    ],
    teacher: {
      initials: "UF",
      avatar: "bg-violet-100 text-violet-700",
      name: "Ustadz Fauzan",
      titleId: "Guru TPA · Hafizh 30 Juz",
      titleEn: "TPA Teacher · Hafizh of 30 Juz",
      bioId:
        "Hafizh 30 Juz dengan sanad, berpengalaman membina hafalan Juz 30 anak-anak, dan aktif membina dakwah cilik di masjid.",
      bioEn:
        "A hafizh of 30 Juz with a sanad, experienced in guiding children's Juz 30 memorization, and active in mentoring little da'wah at the mosque.",
    },
    ctaId: "Daftar ke TPA Sekarang",
    ctaEn: "Enroll in TPA Now",
  },
};

const TAB_ICONS: Record<TabKey, React.ReactNode> = {
  paud: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="15.5" cy="10" r="4" />
      <circle cx="6" cy="15" r="3.2" />
    </svg>
  ),
  tk: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h8" strokeLinecap="round" />
    </svg>
  ),
  tpa: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M12 3a7 7 0 0 0-7 7v9h14v-9a7 7 0 0 0-7-7Z" />
      <path d="M8 15h8" strokeLinecap="round" />
    </svg>
  ),
};

const AGES: Record<TabKey, string> = { paud: "3–4 th", tk: "5–6 th", tpa: "7–12 th" };

const ASPECT_ICONS: Record<CurriculumAspect, { icon: React.ReactNode; chip: string }> = {
  quran_targets: { icon: LEARN_ICONS.book, chip: "text-mint-700" },
  adab: { icon: LEARN_ICONS.heart, chip: "text-rose-600" },
  academics: { icon: LEARN_ICONS.doc, chip: "text-sky-700" },
  life_skills: { icon: LEARN_ICONS.sparkle, chip: "text-violet-700" },
};

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ageLabel(classItem: ClassDetail | undefined, lang: Lang): string {
  if (classItem) {
    return `${classItem.ageMin}–${classItem.ageMax} ${lang === "en" ? "yrs" : "th"}`;
  }
  return "";
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

interface KelasTabsProps {
  lang: Lang;
  classes?: ClassDetail[];
  whatsapp?: string;
}

export function KelasTabs({ lang, classes = [], whatsapp }: KelasTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("paud");
  const tabKeys = Object.keys(PROGRAMS) as TabKey[];

  const focusTab = (key: TabKey) => {
    document.getElementById(`tab-${key}`)?.focus();
    setActiveTab(key);
  };

  const handleTablistKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabKeys.indexOf(activeTab);
    let next: TabKey | null = null;
    if (event.key === "ArrowRight") {
      next = tabKeys[(currentIndex + 1) % tabKeys.length];
    } else if (event.key === "ArrowLeft") {
      next = tabKeys[(currentIndex - 1 + tabKeys.length) % tabKeys.length];
    } else if (event.key === "Home") {
      next = tabKeys[0];
    } else if (event.key === "End") {
      next = tabKeys[tabKeys.length - 1];
    }
    if (next) {
      event.preventDefault();
      focusTab(next);
    }
  };

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-label={lang === "en" ? "Class options" : "Pilihan kelas"}>
        <div
          role="tablist"
          aria-label={lang === "en" ? "Choose a class level" : "Pilih jenjang kelas"}
          onKeyDown={handleTablistKeyDown}
          className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
        >
          {tabKeys.map((key) => {
            const active = activeTab === key;
            const classItem = classes.find(
              (item) => item.code.toLowerCase() === key,
            );
            const age = classItem
              ? ageLabel(classItem, lang)
              : AGES[key];
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`tab-${key}`}
                tabIndex={active ? 0 : -1}
                aria-selected={active}
                aria-controls={`panel-${key}`}
                onClick={() => setActiveTab(key)}
                className={
                  active
                    ? "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-mint-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm"
                    : "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-mint-200 bg-white px-5 py-2.5 text-sm font-bold text-mint-700 transition-colors hover:bg-mint-50"
                }
              >
                {TAB_ICONS[key]}
                {PROGRAMS[key].title}
                <span
                  className={
                    active
                      ? "rounded-full bg-white/25 px-2 py-0.5 text-xs"
                      : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                  }
                >
                  {age}
                </span>
              </button>
            );
          })}
        </div>

        {tabKeys.map((key) => {
          const program = PROGRAMS[key];
          const active = activeTab === key;
          const classItem = classes.find(
            (item) => item.code.toLowerCase() === key,
          );
          const age = classItem ? ageLabel(classItem, lang) : AGES[key];

          const introText =
            pick(lang, classItem?.description, classItem?.descriptionEn) ||
            (lang === "en" ? program.introEn : program.introId);

          const learnItems: LearnItem[] =
            classItem && classItem.curriculum.length > 0
              ? classItem.curriculum.map((item) => ({
                  id: item.title,
                  en: item.titleEn ?? item.title,
                  chip: ASPECT_ICONS[item.aspect].chip,
                  icon: ASPECT_ICONS[item.aspect].icon,
                }))
              : program.learnItems;

          const schedule: ScheduleRow[] =
            classItem && classItem.schedule.length > 0
              ? classItem.schedule.map((row) => ({
                  dayId: row.dayName,
                  dayEn: row.dayName,
                  time: `${formatTime(row.startTime)}–${formatTime(row.endTime)} WIB`,
                  activityId: row.activity,
                  activityEn: row.activity,
                }))
              : program.schedule;

          const fees =
            classItem && classItem.fees !== null
              ? [
                  {
                    labelId: "SPP per bulan",
                    labelEn: "Monthly fee",
                    valueId: formatRupiah(classItem.fees),
                    valueEn: formatRupiah(classItem.fees),
                  },
                  ...(classItem.hours
                    ? [
                        {
                          labelId: "Jam belajar",
                          labelEn: "Hours",
                          valueId: classItem.hours,
                          valueEn: classItem.hours,
                        },
                      ]
                    : []),
                  ...(classItem.capacity
                    ? [
                        {
                          labelId: "Kapasitas",
                          labelEn: "Capacity",
                          valueId: classItem.capacity,
                          valueEn: classItem.capacity,
                        },
                      ]
                    : []),
                ]
              : program.fees;

          const ctaHref = classItem
            ? localizedHref(lang, `/kelas/${classItem.code.toLowerCase()}`)
            : localizedHref(lang, "/kontak");

          return (
            <div
              key={key}
              id={`panel-${key}`}
              role="tabpanel"
              aria-labelledby={`tab-${key}`}
              hidden={!active}
              className="mt-8"
            >
              <div className="grid gap-6 lg:grid-cols-5">
                <article className="overflow-hidden rounded-3xl border border-mint-100 bg-white shadow-sm lg:col-span-3">
                  <div className={`relative aspect-[16/7] overflow-hidden bg-gradient-to-br ${program.gradient}`}>
                    <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${program.badgeLeft}`}>
                      {program.title} Qur&rsquo;ani
                    </span>
                    <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${program.badgeRight}`}>
                      {lang === "en" ? "Ages" : "Usia"} {age}
                    </span>
                    <span className="absolute left-1/2 top-1/2 w-1/3 -translate-x-1/2 -translate-y-1/2">
                      <Scene name={program.scene} />
                    </span>
                  </div>
                  <div className="p-6 sm:p-8">
                    <p className="text-sm leading-relaxed text-mint-900/75">
                      {introText}
                    </p>
                    <h2 className="mt-6 font-display text-lg font-bold text-mint-900">
                      {lang === "en" ? "What Children Learn" : "Yang Dipelajari"}
                    </h2>
                    <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {learnItems.map((item) => (
                        <li key={item.id} className={`flex items-center gap-2.5 rounded-xl ${program.learnBg} px-3.5 py-2.5 text-sm font-bold text-mint-800`}>
                          {iconChip(item.icon, item.chip)}
                          {lang === "en" ? item.en : item.id}
                        </li>
                      ))}
                    </ul>
                    <h2 className="mt-7 font-display text-lg font-bold text-mint-900">
                      {lang === "en" ? "Learning Schedule" : "Jadwal Belajar"}
                    </h2>
                    <div className="mt-3 overflow-hidden rounded-2xl border border-mint-100">
                      <table className="w-full text-left text-sm">
                        <caption className="sr-only">
                          {lang === "en" ? program.scheduleCaptionEn : program.scheduleCaption}
                        </caption>
                        <thead>
                          <tr className="bg-mint-50 text-xs font-extrabold uppercase tracking-wider text-mint-700">
                            <th scope="col" className="px-4 py-3">
                              {lang === "en" ? "Day" : "Hari"}
                            </th>
                            <th scope="col" className="px-4 py-3">
                              {lang === "en" ? "Time" : "Waktu"}
                            </th>
                            <th scope="col" className="px-4 py-3">
                              {lang === "en" ? "Activity" : "Kegiatan"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-mint-100 font-semibold text-mint-900/80">
                          {schedule.map((row) => (
                            <tr key={row.dayId}>
                              <td className="px-4 py-3">{lang === "en" ? row.dayEn : row.dayId}</td>
                              <td className="px-4 py-3">{row.time}</td>
                              <td className="px-4 py-3">{lang === "en" ? row.activityEn : row.activityId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </article>

                <div className="flex flex-col gap-6 lg:col-span-2">
                  <article className="rounded-3xl border border-gold-200 bg-gradient-to-br from-gold-50 to-white p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 font-display text-lg font-bold text-mint-900">
                      <svg
                        className="h-5 w-5 text-gold-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" strokeLinecap="round" />
                      </svg>
                      {lang === "en" ? "Fees & Info" : "Biaya & Info"}
                    </h2>
                    <dl className="mt-4 space-y-3 text-sm">
                      {fees.map((fee) => (
                        <div key={fee.labelId} className="flex items-center justify-between gap-3">
                          <dt className="font-semibold text-mint-800/70">
                            {lang === "en" ? fee.labelEn : fee.labelId}
                          </dt>
                          <dd className="font-extrabold text-mint-900">
                            {lang === "en" ? fee.valueEn : fee.valueId}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-mint-700">
                      {lang === "en"
                        ? "Scholarships are available for orphans and underprivileged children — please contact us."
                        : "Beasiswa tersedia untuk anak yatim & dhuafa — silakan hubungi kami."}
                    </div>
                  </article>

                  <article className="rounded-3xl border border-mint-100 bg-white p-6 shadow-sm">
                    <h2 className="font-display text-lg font-bold text-mint-900">
                      {lang === "en" ? "Teacher" : "Pengajar"}
                    </h2>
                    <div className="mt-4 flex items-center gap-4">
                      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold ${program.teacher.avatar}`}>
                        {program.teacher.initials}
                      </span>
                      <span>
                        <p className="font-extrabold text-mint-900">{program.teacher.name}</p>
                        <p className="text-xs font-semibold text-mint-800/60">
                          {lang === "en" ? program.teacher.titleEn : program.teacher.titleId}
                        </p>
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-mint-900/70">
                      {lang === "en" ? program.teacher.bioEn : program.teacher.bioId}
                    </p>
                  </article>

                  <Link
                    href={ctaHref}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-extrabold text-on-primary shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover"
                  >
                    {lang === "en" ? program.ctaEn : program.ctaId}
                    <ArrowIcon />
                  </Link>
                  <p className="text-center text-xs font-bold text-mint-800/60">
                    {lang === "en" ? "Want a free consultation first?" : "Konsultasi gratis dulu?"}{" "}
                    {whatsapp ? (
                      <a
                        href={waLink(whatsapp)}
                        target="_blank"
                        rel="noopener"
                        className="text-mint-700 underline underline-offset-2 hover:text-mint-800"
                      >
                        {lang === "en" ? "Chat on WhatsApp" : "Chat WhatsApp"}
                      </a>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
