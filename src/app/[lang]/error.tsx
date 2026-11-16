"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function PublicError({ reset }: { reset: () => void }) {
  const { lang } = useParams<{ lang: string }>();
  const english = lang === "en";

  return (
    <section role="alert" className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">
        {english ? "Unable to load this page" : "Halaman belum dapat dimuat"}
      </h1>
      <p className="mt-3 text-slate-600">
        {english
          ? "Please try again in a moment."
          : "Silakan coba lagi beberapa saat lagi."}
      </p>
      <button type="button" onClick={reset} className="mt-6 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white">
        {english ? "Try again" : "Coba lagi"}
      </button>
      <Link href={english ? "/en" : "/"} className="ml-4 text-emerald-700 underline">
        {english ? "Home" : "Beranda"}
      </Link>
    </section>
  );
}
