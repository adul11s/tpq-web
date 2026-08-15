import { SessionProvider, AuthGate } from "@/lib/admin/session";
import { AppShell } from "@/components/admin/AppShell";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthGate>
        <AppShell>{children}</AppShell>
      </AuthGate>
    </SessionProvider>
  );
}
