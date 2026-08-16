import { describe, expect, it } from "vitest";
import { menuForRole } from "../src/lib/admin/menu";

describe("menuForRole", () => {
  it("gives content_manager Dashboard, Konten, Media, Inquiry only", () => {
    expect(menuForRole("content_manager").map((item) => item.href)).toEqual([
      "/admin",
      "/admin/konten",
      "/admin/media",
      "/admin/inquiry",
    ]);
  });

  it("gives admin all ten menu entries including the SMS screens", () => {
    expect(menuForRole("admin").map((item) => item.href)).toEqual([
      "/admin",
      "/admin/konten",
      "/admin/media",
      "/admin/persetujuan",
      "/admin/inquiry",
      "/admin/pengguna",
      "/admin/aktivitas",
      "/admin/pengaturan",
      "/admin/sms/students",
      "/admin/sms/enrollments",
    ]);
    expect(menuForRole("admin").map((item) => item.label)).toContain("Santri");
    expect(menuForRole("admin").map((item) => item.label)).toContain(
      "Pendaftaran Kelas"
    );
  });
});
