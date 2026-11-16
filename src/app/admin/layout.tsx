import { SessionProvider, AuthGate } from "@/lib/admin/session";
import { AppShell } from "@/components/admin/AppShell";
import { RootDocument } from "@/components/RootDocument";

export { metadata } from "@/components/RootDocument";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootDocument lang="id">
      <SessionProvider>
        <AuthGate>
          <AppShell>{children}</AppShell>
        </AuthGate>
      </SessionProvider>
    </RootDocument>
  );
}
