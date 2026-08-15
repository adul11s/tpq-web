import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { isLang, type Lang } from "@/lib/lang";

export function generateStaticParams(): { lang: Lang }[] {
  return [{ lang: "id" }, { lang: "en" }];
}

interface LangLayoutProps {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}

export default async function LangLayout({ params, children }: LangLayoutProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";

  return (
    <div className="flex min-h-full flex-col">
      <Navbar lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} />
      <AnalyticsTracker lang={lang} />
    </div>
  );
}
