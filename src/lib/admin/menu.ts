import type { Role } from "../types/admin";

export type AdminRole = "admin" | "content_manager";

export interface AdminMenuItem {
  href: string;
  label: string;
  roles: Role[];
}

export const ADMIN_MENU: AdminMenuItem[] = [
  { href: "/admin", label: "Dashboard", roles: ["admin", "content_manager"] },
  { href: "/admin/konten", label: "Konten", roles: ["admin", "content_manager"] },
  { href: "/admin/media", label: "Media", roles: ["admin", "content_manager"] },
  { href: "/admin/persetujuan", label: "Persetujuan", roles: ["admin"] },
  { href: "/admin/inquiry", label: "Inquiry", roles: ["admin", "content_manager"] },
  { href: "/admin/pengguna", label: "Pengguna", roles: ["admin"] },
  { href: "/admin/aktivitas", label: "Aktivitas", roles: ["admin"] },
  { href: "/admin/pengaturan", label: "Pengaturan", roles: ["admin"] },
  { href: "/admin/sms/students", label: "Santri", roles: ["admin"] },
  { href: "/admin/sms/enrollments", label: "Pendaftaran Kelas", roles: ["admin"] },
];

export function menuForRole(role: Role): AdminMenuItem[] {
  return ADMIN_MENU.filter((item) => item.roles.includes(role));
}
