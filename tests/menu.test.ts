import { describe, expect, it } from "vitest";
import {
  menuForRole,
  menuSectionsForRole,
} from "../src/lib/admin/menu";

describe("menuForRole", () => {
  it("gives content_manager Dashboard, Konten, Media, Inquiry only", () => {
    expect(menuForRole("content_manager").map((item) => item.href)).toEqual([
      "/admin",
      "/admin/konten",
      "/admin/media",
      "/admin/inquiry",
    ]);
  });

  it("gives admin all thirteen menu entries including the SMS screens", () => {
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
      "/admin/sms/hafalan",
      "/admin/sms/absensi",
      "/admin/sms/rapor",
    ]);
    expect(menuForRole("admin").map((item) => item.label)).toContain("Santri");
    expect(menuForRole("admin").map((item) => item.label)).toContain(
      "Pendaftaran Kelas"
    );
    expect(menuForRole("admin").map((item) => item.label)).toContain(
      "Hafalan"
    );
    expect(menuForRole("admin").map((item) => item.label)).toContain(
      "Absensi"
    );
    expect(menuForRole("admin").map((item) => item.label)).toContain("Rapor");
  });

  it("gives teacher the Hafalan and Absensi SMS screens", () => {
    expect(menuForRole("teacher").map((item) => item.href)).toEqual([
      "/admin/sms/hafalan",
      "/admin/sms/absensi",
    ]);
  });
});

describe("menu sections (SMS group)", () => {
  it("groups the five SMS screens under one SMS section for admin", () => {
    const sections = menuSectionsForRole("admin");
    const sms = sections.find((section) => section.label === "SMS");
    expect(sms?.items.map((item) => item.href)).toEqual([
      "/admin/sms/students",
      "/admin/sms/enrollments",
      "/admin/sms/hafalan",
      "/admin/sms/absensi",
      "/admin/sms/rapor",
    ]);
    expect(sms?.items.map((item) => item.label)).toEqual([
      "Santri",
      "Pendaftaran Kelas",
      "Hafalan",
      "Absensi",
      "Rapor",
    ]);
  });

  it("gives teacher only Hafalan and Absensi under the SMS section", () => {
    const sections = menuSectionsForRole("teacher");
    expect(sections).toHaveLength(1);
    expect(sections[0].label).toBe("SMS");
    expect(sections[0].items.map((item) => item.href)).toEqual([
      "/admin/sms/hafalan",
      "/admin/sms/absensi",
    ]);
  });

  it("hides the SMS section from content_manager", () => {
    expect(
      menuSectionsForRole("content_manager").some((s) => s.label === "SMS")
    ).toBe(false);
  });

  it("marks Santri/Enrollments/Rapor admin-only and Hafalan/Absensi admin+teacher", () => {
    const adminSections = menuSectionsForRole("admin");
    const sms = adminSections.find((s) => s.label === "SMS");
    expect(sms?.items.map((item) => [item.href, item.roles])).toEqual([
      ["/admin/sms/students", ["admin"]],
      ["/admin/sms/enrollments", ["admin"]],
      ["/admin/sms/hafalan", ["admin", "teacher"]],
      ["/admin/sms/absensi", ["admin", "teacher"]],
      ["/admin/sms/rapor", ["admin"]],
    ]);
  });
});