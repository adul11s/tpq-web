import type { Metadata } from "next";
import { ChangePassword } from "@/components/parent/ChangePassword";
import { isLang, type Lang } from "@/lib/lang";
import { buildMetadata } from "@/lib/seo";

interface GantiPasswordPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: GantiPasswordPageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  return buildMetadata({
    lang,
    path: "/parent/ganti-password",
    titleId: "Ganti Kata Sandi",
    titleEn: "Change Password",
    descriptionId:
      "Perbarui kata sandi akun portal orang tua TPQ Qur'ani untuk melanjutkan.",
    descriptionEn:
      "Update your TPQ Qur'ani parent portal password to continue.",
  });
}

export default async function GantiPasswordPage({
  params,
}: GantiPasswordPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-mint-50 via-cream to-gold-50">
      <div className="star-pattern absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-8 sm:py-12">
        <ChangePassword lang={lang} />
      </div>
    </section>
  );
}