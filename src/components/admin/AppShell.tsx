"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminApi } from "@/lib/api/auth";
import { menuForRole } from "@/lib/admin/menu";
import { redirectToLogin, useSession } from "@/lib/admin/session";
import { Button } from "@/components/ui/Button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const items = menuForRole(user.role);
  const activeItem = items.find(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const initials = user.full_name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await adminApi.logout();
    } catch {
      redirectToLogin();
      return;
    }
    redirectToLogin();
  }
  return (
    <div className="flex min-h-screen bg-mint-50/60">
      <aside
        className="hidden w-64 shrink-0 flex-col border-r border-mint-800 bg-mint-950 lg:flex"
        aria-label="Menu admin"
      >
        <div className="flex items-center gap-2.5 border-b border-mint-900 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-600 text-white">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-white">
              TPQ Qur&rsquo;ani
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-mint-400">
              Panel Admin
            </span>
          </span>
        </div>
        <p className="px-5 pb-1 pt-5 text-[11px] font-bold uppercase tracking-widest text-mint-500">
          Menu
        </p>
        <nav className="mt-1 space-y-0.5 px-3 pb-4">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex items-center gap-3 rounded-xl bg-mint-700 px-3 py-2.5 text-sm font-bold text-white"
                    : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-mint-300 transition-colors hover:bg-mint-900 hover:text-white"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-mint-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
            <h1 className="text-lg font-bold text-mint-900">
              {activeItem?.label ?? "Panel Admin"}
            </h1>
            <div className="ml-auto flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-mint-100 text-sm font-bold text-mint-700"
                aria-hidden="true"
              >
                {initials}
              </span>
              <span className="hidden leading-tight md:block">
                <span className="block text-sm font-bold text-mint-900">
                  {user.full_name}
                </span>
                <span className="block text-[11px] font-bold text-mint-600">
                  {user.email}
                </span>
              </span>
              <Button
                variant="outline"
                size="sm"
                loading={loggingOut}
                onClick={handleLogout}
              >
                Keluar
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
