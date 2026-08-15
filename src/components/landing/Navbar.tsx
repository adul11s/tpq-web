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
    { href: "/", label: lang === "en" ? "Home" : "Beranda" },
    { href: "/kelas", label: lang === "en" ? "Class Profiles" : "Profil Kelas" },
    { href: "/resources", label: lang === "en" ? "Downloads" : "Materi & Unduhan" },
    { href: "/doa", label: lang === "en" ? "Daily Prayers" : "Doa Harian" },
    { href: "/kontak", label: lang === "en" ? "Contact" : "Kontak" },
  ];
}

function CrescentLogo() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      <path d="M11 7.5 11.9 9.9 14.3 10.8 11.9 11.7 11 14.1 10.1 11.7 7.7 10.8 10.1 9.9Z" />
    </svg>
  );
}

export function Navbar({ lang }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navLinks = localizeNavLinks(lang);
  const rawPath = pathname.replace(/^\/en/, "") || "/";

  const switchHref =
    lang === "en"
      ? pathname.replace(/^\/en/, "") || "/"
      : `/en${pathname === "/" ? "" : pathname}`;

  return (
    <header className="sticky top-0 z-40 border-b border-mint-200 bg-cream/90 backdrop-blur">
      <nav
        aria-label={lang === "en" ? "Main navigation" : "Navigasi utama"}
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <Link
          href={localizedHref(lang, "/")}
          aria-label={lang === "en" ? "TPQ Qur'ani — home" : "TPQ Qur'ani — beranda"}
          className="flex min-h-11 items-center gap-2.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <CrescentLogo />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-extrabold text-mint-900">
              TPQ Qur&rsquo;ani
            </span>
            <span className="hidden text-[11px] font-bold uppercase tracking-widest text-mint-600 sm:block">
              PAUD &middot; TK &middot; TPA
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = rawPath === link.href;
            return (
              <Link
                key={link.href}
                href={localizedHref(lang, link.href)}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-lg bg-mint-100 px-3 py-2.5 text-sm font-extrabold text-mint-800"
                    : "rounded-lg px-3 py-2.5 text-sm font-bold text-mint-700 transition-colors hover:bg-mint-50 hover:text-mint-800"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={localizedHref(lang, "/kelas")}
            className="hidden min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-extrabold text-on-primary shadow-sm transition-colors hover:bg-primary-hover md:inline-flex"
          >
            {lang === "en" ? "Enroll Now" : "Daftar Sekarang"}
          </Link>
          <Link
            href={switchHref}
            hrefLang={lang === "en" ? "id" : "en"}
            className="ml-2 flex min-h-11 items-center rounded-lg border border-mint-300 px-3 text-sm font-bold text-mint-700 transition-colors hover:bg-mint-50"
          >
            {lang === "en" ? "ID" : "EN"}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="inline-flex min-h-11 items-center justify-center rounded-lg p-2.5 text-mint-800 hover:bg-mint-50 md:hidden"
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
        <div id="mobile-menu" className="border-t border-mint-200 bg-white px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => {
            const active = rawPath === link.href;
            return (
              <Link
                key={link.href}
                href={localizedHref(lang, link.href)}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "block rounded-lg bg-mint-100 px-3 py-2.5 text-sm font-extrabold text-mint-800"
                    : "block rounded-lg px-3 py-2.5 text-sm font-bold text-mint-800 hover:bg-mint-50"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={localizedHref(lang, "/kelas")}
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-extrabold text-on-primary"
          >
            {lang === "en" ? "Enroll Now" : "Daftar Sekarang"}
          </Link>
          <Link
            href={switchHref}
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg border border-mint-300 px-4 py-2.5 text-center text-sm font-bold text-mint-700"
          >
            {lang === "en" ? "Ganti ke Bahasa Indonesia" : "Switch to English"}
          </Link>
        </div>
      ) : null}
    </header>
  );
}