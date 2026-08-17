"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useParentSession } from "@/lib/parent/session";
import { localizedHref, pick, type Lang } from "@/lib/lang";

export function ParentGate({
  children,
  lang,
}: {
  children: ReactNode;
  lang: Lang;
}) {
  const { status, mustChangePassword } = useParentSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "guest") {
      router.replace(localizedHref(lang, "/parent/login"));
    } else if (status === "authed" && mustChangePassword) {
      router.replace(localizedHref(lang, "/parent/ganti-password"));
    }
  }, [status, mustChangePassword, lang, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div
          role="status"
          aria-label={pick(lang, "Memuat", "Loading")}
          className="h-10 w-10 animate-spin rounded-full border-4 border-mint-200 border-t-mint-600"
        />
      </div>
    );
  }

  if (status === "guest") {
    return null;
  }

  if (status === "authed" && mustChangePassword) {
    return null;
  }

  return <>{children}</>;
}