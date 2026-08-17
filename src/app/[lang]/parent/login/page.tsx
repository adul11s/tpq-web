import type { Metadata } from "next";
import Link from "next/link";
import { ParentLogin } from "@/components/parent/ParentLogin";
import { isLang, localizedHref, type Lang } from "@/lib/lang";
import { buildMetadata } from "@/lib/seo";

interface ParentLoginPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: ParentLoginPageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  return buildMetadata({
    lang,
    path: "/parent/login",
    titleId: "Masuk Orang Tua",
    titleEn: "Parent Login",
    descriptionId:
      "Masuk ke portal orang tua TPQ Qur'ani untuk melihat rapor dan perkembangan ananda.",
    descriptionEn:
      "Log in to the TPQ Qur'ani parent portal to view your child's report cards and progress.",
  });
}

export default async function ParentLoginPage({
  params,
}: ParentLoginPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-mint-50 via-cream to-gold-50">
      <div className="star-pattern absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-8 sm:py-12">
        <Link
          href={localizedHref(lang, "/")}
          className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-bold text-mint-700 transition-colors hover:text-mint-900"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
          </svg>
          {lang === "en" ? "Back to site" : "Kembali ke situs"}
        </Link>

        <ParentLogin lang={lang} />
      </div>
    </section>
  );
}