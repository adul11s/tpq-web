"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminApi } from "../api/auth";
import { setOnUnauthorized } from "../api/admin-client";
import type { AdminMe } from "../types/admin";
import { Skeleton } from "@/components/ui/Skeleton";
import { redirectToLogin } from "./redirect";

export { redirectToLogin };

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface SessionValue {
  status: SessionStatus;
  user: AdminMe | null;
  refresh: () => void;
  logout: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<AdminMe | null>(null);

  const probe = useCallback(() => {
    adminApi
      .me()
      .then((me) => {
        setUser(me);
        setStatus("authenticated");
      })
      .catch(() => {
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => redirectToLogin("expired"));
    probe();
  }, [probe]);

  return (
    <SessionContext.Provider value={{ status, user, refresh: probe, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return value;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();

  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Skeleton className="h-24 w-64" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
        <p className="text-sm font-bold text-mint-900">
          Sesi berakhir. Silakan masuk kembali.
        </p>
        <Link
          href="/admin/login"
          className="inline-flex items-center justify-center rounded-lg bg-mint-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-mint-700"
        >
          Masuk ke Panel Admin
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
