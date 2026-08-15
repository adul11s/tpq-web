import Link from "next/link";
import { fetchSiteSettings } from "@/lib/data/pages";
import { localizedHref, pick, type Lang } from "@/lib/lang";

interface FooterProps {
  lang: Lang;
}

export async function Footer({ lang }: FooterProps) {
  const settings = await fetchSiteSettings();

  return (
    <footer className="mt-auto border-t border-emerald-100 bg-emerald-950 text-emerald-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">TPQ Qur&rsquo;ani</p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-300">
            {lang === "en"
              ? "PAUD, TK, and TPA Qur'ani — raising children who love the Qur'an and noble character."
              : "PAUD, TK, dan TPA Qur'ani — mendidik anak mencintai Al-Qur'an dan berakhlak mulia sejak usia dini."}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            {lang === "en" ? "Menu" : "Menu"}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href={localizedHref(lang, "/kelas")} className="hover:text-white">
                {lang === "en" ? "Programs" : "Program Kelas"}
              </Link>
            </li>
            <li>
              <Link href={localizedHref(lang, "/resources")} className="hover:text-white">
                {lang === "en" ? "Downloads" : "Materi & Unduhan"}
              </Link>
            </li>
            <li>
              <Link href={localizedHref(lang, "/doa")} className="hover:text-white">
                {lang === "en" ? "Daily Prayers" : "Doa Harian"}
              </Link>
            </li>
            <li>
              <Link href={localizedHref(lang, "/privacy-policy")} className="hover:text-white">
                {lang === "en" ? "Privacy Policy" : "Kebijakan Privasi"}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            {lang === "en" ? "Contact" : "Kontak"}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-emerald-300">
            <li>{settings.address}</li>
            <li>{settings.phone} (WhatsApp)</li>
            <li>{settings.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-emerald-900 py-4 text-center text-xs text-emerald-400">
        © {new Date().getFullYear()} TPQ Qur&rsquo;ani.{" "}
        {pick(
          lang,
          "Seluruh hak cipta dilindungi.",
          "All rights reserved.",
        )}
      </div>
    </footer>
  );
}
