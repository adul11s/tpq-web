import type { Metadata } from "next";
import { ParentGate } from "@/components/parent/ParentGate";
import { RaporView } from "@/components/parent/RaporView";
import { isLang, type Lang } from "@/lib/lang";
import { buildMetadata } from "@/lib/seo";

interface RaporPageProps {
  params: Promise<{ lang: string; studentId: string; periodId: string }>;
}

export async function generateMetadata({
  params,
}: RaporPageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  return buildMetadata({
    lang,
    path: "/parent/rapor",
    titleId: "Unduh Rapor",
    titleEn: "Download Report",
    descriptionId:
      "Lihat atau unduh rapor semester ananda di portal orang tua TPQ Qur'ani.",
    descriptionEn:
      "View or download your child's semester report in the TPQ Qur'ani parent portal.",
  });
}

export default async function RaporPage({ params }: RaporPageProps) {
  const { lang: langParam, studentId: studentIdParam, periodId: periodIdParam } =
    await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const studentId = Number.parseInt(studentIdParam, 10);
  const periodId = Number.parseInt(periodIdParam, 10);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-mint-50 via-cream to-gold-50">
      <div className="star-pattern absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-8 sm:py-12">
        <ParentGate lang={lang}>
          <RaporView lang={lang} studentId={studentId} periodId={periodId} />
        </ParentGate>
      </div>
    </section>
  );
}
