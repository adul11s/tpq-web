import type { Metadata } from "next";
import { ChildrenList } from "@/components/parent/ChildrenList";
import { ParentGate } from "@/components/parent/ParentGate";
import { isLang, type Lang } from "@/lib/lang";
import { buildMetadata } from "@/lib/seo";

interface AnakPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: AnakPageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  return buildMetadata({
    lang,
    path: "/parent/anak",
    titleId: "Anak Saya",
    titleEn: "My Children",
    descriptionId:
      "Lihat daftar ananda dan rapor semester di portal orang tua TPQ Qur'ani.",
    descriptionEn:
      "View your children and their semester reports in the TPQ Qur'ani parent portal.",
  });
}

export default async function AnakPage({ params }: AnakPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-mint-50 via-cream to-gold-50">
      <div className="star-pattern absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-8 sm:py-12">
        <ParentGate lang={lang}>
          <ChildrenList lang={lang} />
        </ParentGate>
      </div>
    </section>
  );
}