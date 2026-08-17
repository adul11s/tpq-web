import { ParentNav } from "@/components/parent/ParentNav";
import { ParentSessionProvider } from "@/lib/parent/session";
import { isLang, type Lang } from "@/lib/lang";

interface ParentLayoutProps {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}

export default async function ParentLayout({
  params,
  children,
}: ParentLayoutProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";

  return (
    <ParentSessionProvider>
      <ParentNav lang={lang} />
      {children}
    </ParentSessionProvider>
  );
}
