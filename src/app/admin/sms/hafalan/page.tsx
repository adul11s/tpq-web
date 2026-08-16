"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/admin/session";
import type { Role } from "@/lib/types/admin";
import { HafalanRecorder } from "@/components/admin/sms/HafalanRecorder";

export const dynamic = "force-dynamic";

type RecorderRole = "admin" | "teacher";

const ALLOWED_ROLES: readonly RecorderRole[] = ["admin", "teacher"];

function isRecorderRole(role: Role): role is RecorderRole {
  return ALLOWED_ROLES.includes(role as RecorderRole);
}

export default function SmsHafalanPage() {
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user && !isRecorderRole(user.role)) {
      router.replace("/admin");
    }
  }, [user, router]);

  if (!user) return null;

  if (!isRecorderRole(user.role)) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        Halaman ini khusus untuk admin dan guru.
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-mint-900">Hafalan</h2>
      <HafalanRecorder role={user.role} />
    </div>
  );
}
