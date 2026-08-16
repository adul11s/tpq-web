"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/admin/session";
import { EnrollmentsScreen } from "@/components/admin/sms/EnrollmentsScreen";

export const dynamic = "force-dynamic";

export default function SmsEnrollmentsPage() {
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/admin");
    }
  }, [user, router]);

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <p
        role="alert"
        className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        Halaman ini khusus untuk admin.
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-mint-900">
        Pendaftaran Kelas
      </h2>
      <EnrollmentsScreen />
    </div>
  );
}
