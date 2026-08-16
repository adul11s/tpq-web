import { ParentSessionProvider } from "@/lib/parent/session";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ParentSessionProvider>{children}</ParentSessionProvider>;
}