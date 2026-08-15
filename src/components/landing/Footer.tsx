import Link from "next/link";
import { fetchSiteSettings } from "@/lib/data/pages";
import { localizedHref, pick, type Lang } from "@/lib/lang";

interface FooterProps {
  lang: Lang;
}

const MENU_LINKS: { href: string; id: string; en: string }[] = [
  { href: "/", id: "Beranda", en: "Home" },
  { href: "/kelas", id: "Profil Kelas", en: "Class Profiles" },
  { href: "/resources", id: "Materi & Unduhan", en: "Downloads" },
  { href: "/doa", id: "Doa Harian", en: "Daily Prayers" },
  { href: "/kontak", id: "Kontak", en: "Contact" },
  { href: "/privacy-policy", id: "Kebijakan Privasi", en: "Privacy Policy" },
];

export async function Footer({ lang }: FooterProps) {
  const settings = await fetchSiteSettings();

  return (
    <footer className="mt-auto bg-mint-950 text-mint-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="flex items-center gap-2.5 font-display text-lg font-extrabold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            </span>
            TPQ Qur&rsquo;ani
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-mint-300">
            {lang === "en"
              ? "PAUD, TK, and TPA Qur'ani — raising children who love the Qur'an and noble character from an early age, in a cheerful learning atmosphere."
              : "PAUD, TK, dan TPA Qur'ani — mendidik anak mencintai Al-Qur'an dan berakhlak mulia sejak usia dini, dalam suasana belajar yang ceria."}
          </p>
          <p
            lang="ar"
            dir="rtl"
            className="mt-4 font-arabic text-lg text-gold-300"
          >
            اَللّٰهُمَّ اجْعَلْهُ قُرْآنًا مَأْنُوْسًا بِهِ
          </p>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-mint-400">
            {pick(lang, "Menu", "Menu")}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {MENU_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={localizedHref(lang, link.href)}
                  className="font-semibold text-mint-200 transition-colors hover:text-white"
                >
                  {lang === "en" ? link.en : link.id}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-mint-400">
            {pick(lang, "Kontak", "Contact")}
          </p>
          <ul className="mt-3 space-y-2.5 text-sm font-semibold text-mint-200">
            <li className="flex items-start gap-2.5">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-mint-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z"
                />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {settings.address}
            </li>
            <li className="flex items-start gap-2.5">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-mint-400"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-1.5-.5 12 12 0 0 1-4.4-3.9 5 5 0 0 1-1-2.7c0-1.2.6-1.8 1-2.2l.5-.5c.2-.2.4-.2.6-.2h.4c.2 0 .4-.1.6.4l.8 1.9c.1.2.1.4 0 .6l-.3.5-.5.5c-.2.2-.3.4-.2.7.2.3.8 1.3 1.6 2.1 1.1 1 2 1.4 2.4 1.5.3.2.5.1.7-.1l1-1.2c.2-.3.4-.3.7-.2l2 1c.3.1.5.2.5.4.1.3.1.8-.2 1.3Z" />
              </svg>
              {settings.phone} (WhatsApp)
            </li>
            <li className="flex items-start gap-2.5">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-mint-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" strokeLinecap="round" />
              </svg>
              {settings.hours}
            </li>
            <li className="flex items-start gap-2.5">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-mint-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              halo@tpqqurani.sch.id
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-mint-900 py-4 text-center text-xs font-bold text-mint-500">
        © {new Date().getFullYear()} TPQ Qur&rsquo;ani.{" "}
        {pick(lang, "Seluruh hak cipta dilindungi.", "All rights reserved.")}
      </div>
    </footer>
  );
}