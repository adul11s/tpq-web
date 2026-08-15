"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { localizedHref, type Lang } from "@/lib/lang";

interface NavbarProps {
  lang: Lang;
}

function localizeNavLinks(lang: Lang) {
  return [
    { href: localizedHref(lang, "/"), label: lang === "en" ? "Home" : "Beranda" },
    { href: localizedHref(lang, "/kelas"), label: lang === "en" ? "Programs" : "Kelas" },
    { href: localizedHref(lang, "/resources"), label: lang === "en" ? "Downloads" : "Materi & Unduhan" },
    { href: localizedHref(lang, "/doa"), label: lang === "en" ? "Daily Prayers" : "Doa Harian" },
    { href: localizedHref(lang, "/kontak"), label: lang === "en" ? "Contact" : "Kontak" },
  ];
}

export function Navbar({ lang }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navLinks = localizeNavLinks(lang);

  const switchHref =
    lang === "en"
      ? pathname.replace(/^\/en/, "") || "/"
      : `/en${pathname === "/" ? "" : pathname}`;

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href={localizedHref(lang, "/")} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </span>
          <span className="text-lg font-bold text-slate-900">
            TPQ Qur&rsquo;ani
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={localizedHref(lang, "/kelas")}
            className="ml-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            {lang === "en" ? "Enroll Now" : "Daftar Sekarang"}
          </Link>
          <Link
            href={switchHref}
            hrefLang={lang === "en" ? "id" : "en"}
            className="ml-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {lang === "en" ? "ID" : "EN"}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-2 text-slate-700 hover:bg-emerald-50 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {open ? (
        <div className="border-t border-emerald-100 bg-white px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={localizedHref(lang, "/kelas")}
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            {lang === "en" ? "Enroll Now" : "Daftar Sekarang"}
          </Link>
          <Link
            href={switchHref}
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-600"
          >
            {lang === "en" ? "Ganti ke Bahasa Indonesia" : "Switch to English"}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
