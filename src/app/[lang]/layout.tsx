import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { SkipLink } from "@/components/landing/SkipLink";
import { isLang, type Lang } from "@/lib/lang";
import { RootDocument } from "@/components/RootDocument";
import { notFound } from "next/navigation";

export { metadata } from "@/components/RootDocument";

export function generateStaticParams(): { lang: Lang }[] {
  return [{ lang: "id" }, { lang: "en" }];
}

interface LangLayoutProps {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}

export default async function LangLayout({ params, children }: LangLayoutProps) {
  const { lang: langParam } = await params;
  if (!isLang(langParam)) notFound();
  const lang = langParam;

  return (
    <RootDocument lang={lang}>
      <SkipLink lang={lang} />
      <Navbar lang={lang} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer lang={lang} />
      <AnalyticsTracker lang={lang} />
    </RootDocument>
  );
}
