import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "./msw-server";
import { smsApi } from "@/lib/api/sms";

describe("smsApi", () => {
  it("lists students", async () => {
    server.use(
      http.get("*/api/v1/admin/students", () =>
        HttpResponse.json({
          students: [
            {
              id: 1,
              nis: "TPQ-2026-0001",
              full_name: "Aisyah",
              birth_date: null,
              gender: "perempuan",
              class: "TK Qur'ani Bintang",
            },
          ],
        }),
      ),
    );
    const res = await smsApi.listStudents();
    expect(res.students[0].full_name).toBe("Aisyah");
    expect(res.students[0].class).toBe("TK Qur'ani Bintang");
  });

  it("creates a student with snake_case body", async () => {
    let captured: unknown;
    server.use(
      http.post("*/api/v1/admin/students", async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ id: 2, full_name: "Bilal" }, { status: 201 });
      }),
    );
    const res = await smsApi.createStudent({ nis: "TPQ-2026-0002", full_name: "Bilal", gender: "laki-laki" });
    expect(captured).toEqual({ nis: "TPQ-2026-0002", full_name: "Bilal", gender: "laki-laki" });
    expect(res).toEqual({ id: 2, full_name: "Bilal" });
  });

  it("updates a student via PATCH", async () => {
    let captured: unknown;
    server.use(
      http.patch("*/api/v1/admin/students/:id", async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ id: 2, full_name: "Bilal Ahmad" });
      }),
    );
    const res = await smsApi.updateStudent(2, { full_name: "Bilal Ahmad" });
    expect(captured).toEqual({ full_name: "Bilal Ahmad" });
    expect(res.full_name).toBe("Bilal Ahmad");
  });

  it("deletes a student", async () => {
    server.use(
      http.delete("*/api/v1/admin/students/:id", () => HttpResponse.json({ ok: true })),
    );
    const res = await smsApi.deleteStudent(2);
    expect(res).toEqual({ ok: true });
  });

  it("lists guardianships", async () => {
    server.use(
      http.get("*/api/v1/admin/guardianships", () =>
        HttpResponse.json({
          guardianships: [
            {
              id: 1,
              user_id: 9,
              parent_email: "ibu@example.com",
              student_id: 1,
              student_name: "Aisyah",
              relation: "ibu",
            },
          ],
        }),
      ),
    );
    const res = await smsApi.listGuardianships();
    expect(res.guardianships[0]).toMatchObject({ parent_email: "ibu@example.com", relation: "ibu" });
  });

  it("creates a guardianship", async () => {
    let captured: unknown;
    server.use(
      http.post("*/api/v1/admin/guardianships", async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ id: 5 }, { status: 201 });
      }),
    );
    const res = await smsApi.createGuardianship({ user_id: 9, student_id: 1 });
    expect(captured).toEqual({ user_id: 9, student_id: 1 });
    expect(res.id).toBe(5);
  });

  it("deletes a guardianship", async () => {
    server.use(
      http.delete("*/api/v1/admin/guardianships/:id", () => HttpResponse.json({ ok: true })),
    );
    const res = await smsApi.deleteGuardianship(5);
    expect(res).toEqual({ ok: true });
  });

  it("lists academic years", async () => {
    server.use(
      http.get("*/api/v1/admin/academic-years", () =>
        HttpResponse.json({ academic_years: [{ id: 1, name: "2026/2027", is_active: true }] }),
      ),
    );
    const res = await smsApi.listAcademicYears();
    expect(res.academic_years[0]).toEqual({ id: 1, name: "2026/2027", is_active: true });
  });

  it("creates an academic year", async () => {
    let captured: unknown;
    server.use(
      http.post("*/api/v1/admin/academic-years", async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ id: 2, name: "2027/2028" }, { status: 201 });
      }),
    );
    const res = await smsApi.createAcademicYear({ name: "2027/2028", start_month: 7, is_active: true });
    expect(captured).toEqual({ name: "2027/2028", start_month: 7, is_active: true });
    expect(res.name).toBe("2027/2028");
  });

  it("lists enrollments", async () => {
    server.use(
      http.get("*/api/v1/admin/enrollments", () =>
        HttpResponse.json({
          enrollments: [
            {
              id: 1,
              student_id: 1,
              student_name: "Aisyah",
              class_id: 2,
              class_code: "TPA",
              academic_year_id: 1,
              status: "active",
            },
          ],
        }),
      ),
    );
    const res = await smsApi.listEnrollments();
    expect(res.enrollments[0]).toMatchObject({ class_code: "TPA", status: "active" });
  });

  it("creates an enrollment", async () => {
    let captured: unknown;
    server.use(
      http.post("*/api/v1/admin/enrollments", async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ id: 3 }, { status: 201 });
      }),
    );
    const res = await smsApi.createEnrollment({ student_id: 1, class_id: 2, academic_year_id: 1, status: "active" });
    expect(captured).toEqual({ student_id: 1, class_id: 2, academic_year_id: 1, status: "active" });
    expect(res.id).toBe(3);
  });

  it("deletes an enrollment", async () => {
    server.use(
      http.delete("*/api/v1/admin/enrollments/:id", () => HttpResponse.json({ ok: true })),
    );
    const res = await smsApi.deleteEnrollment(3);
    expect(res).toEqual({ ok: true });
  });

  it("lists hafalan targets, optionally filtered by level", async () => {
    server.use(
      http.get("*/api/v1/admin/hafalan-targets", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("level")).toBe("tpa");
        return HttpResponse.json({
          targets: [{ id: 1, level: "tpa", surah_name: "Al-Mulk", sort_order: 1 }],
        });
      }),
    );
    const res = await smsApi.listHafalanTargets("tpa");
    expect(res.targets[0]).toEqual({ id: 1, level: "tpa", surah_name: "Al-Mulk", sort_order: 1 });
  });

  it("lists hafalan records, optionally filtered by student", async () => {
    server.use(
      http.get("*/api/v1/admin/hafalan", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("student_id")).toBe("1");
        return HttpResponse.json({
          records: [
            {
              id: 4,
              student_id: 1,
              student_name: "Aisyah",
              surah_name: "An-Naba",
              status: "tuntas",
              fluency: "lancar",
              updated_by: 1,
              updated_at: "2026-08-16T08:00:00.000Z",
            },
          ],
        });
      }),
    );
    const res = await smsApi.listHafalan(1);
    expect(res.records[0]).toMatchObject({ surah_name: "An-Naba", fluency: "lancar" });
  });

  it("upserts a hafalan record via PUT with snake_case body", async () => {
    let captured: unknown;
    server.use(
      http.put("*/api/v1/admin/hafalan", async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({
          id: 7,
          student_id: 3,
          surah_name: "Al-Fatihah",
          status: "tuntas",
          fluency: "lancar",
        });
      }),
    );
    const res = await smsApi.upsertHafalan({
      student_id: 3,
      surah_name: "Al-Fatihah",
      status: "tuntas",
      fluency: "lancar",
    });
    expect(captured).toEqual({ student_id: 3, surah_name: "Al-Fatihah", status: "tuntas", fluency: "lancar" });
    expect(res.status).toBe("tuntas");
  });

  it("lists attendance per class and date", async () => {
    server.use(
      http.get("*/api/v1/admin/attendance", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("class_id")).toBe("2");
        expect(url.searchParams.get("date")).toBe("2026-08-16");
        return HttpResponse.json({
          attendance: [
            { enrollment_id: 5, student_name: "Aisyah", date: "2026-08-16", status: "hadir", note: null },
          ],
        });
      }),
    );
    const res = await smsApi.listAttendance({ class_id: 2, date: "2026-08-16" });
    expect(res.attendance[0]).toMatchObject({ enrollment_id: 5, status: "hadir" });
  });

  it("posts attendance as a batch body", async () => {
    let captured: unknown;
    server.use(
      http.post("*/api/v1/admin/attendance", async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ ok: true, saved: 2 });
      }),
    );
    const res = await smsApi.postAttendance({
      class_id: 2,
      date: "2026-08-16",
      records: [
        { enrollment_id: 5, status: "hadir" },
        { enrollment_id: 6, status: "alpha", note: "Tidak hadir" },
      ],
    });
    expect(captured).toEqual({
      class_id: 2,
      date: "2026-08-16",
      records: [
        { enrollment_id: 5, status: "hadir" },
        { enrollment_id: 6, status: "alpha", note: "Tidak hadir" },
      ],
    });
    expect(res.saved).toBe(2);
  });

  it("lists adab criteria", async () => {
    server.use(
      http.get("*/api/v1/admin/adab-criteria", () =>
        HttpResponse.json({ criteria: [{ id: 1, name: "Salam", sort_order: 1 }] }),
      ),
    );
    const res = await smsApi.listAdabCriteria();
    expect(res.criteria[0]).toEqual({ id: 1, name: "Salam", sort_order: 1 });
  });

  it("lists adab ratings", async () => {
    server.use(
      http.get("*/api/v1/admin/adab-ratings", () =>
        HttpResponse.json({ ratings: [{ id: 1, student_id: 1, criterion_id: 1, rapor_period_id: 2, scale: 4 }] }),
      ),
    );
    const res = await smsApi.listAdabRatings();
    expect(res.ratings[0]).toMatchObject({ scale: 4, criterion_id: 1 });
  });

  it("lists rapor periods", async () => {
    server.use(
      http.get("*/api/v1/admin/rapor-periods", () =>
        HttpResponse.json({
          periods: [
            { id: 1, academic_year_id: 1, academic_year: "2026/2027", semester: "ganjil", status: "open" },
          ],
        }),
      ),
    );
    const res = await smsApi.listRaporPeriods();
    expect(res.periods[0]).toMatchObject({ semester: "ganjil", academic_year: "2026/2027" });
  });

  it("locks a rapor period", async () => {
    server.use(
      http.post("*/api/v1/admin/rapor-periods/:id/lock", () =>
        HttpResponse.json({ id: 1, status: "locked" }),
      ),
    );
    const res = await smsApi.lockPeriod(1);
    expect(res.status).toBe("locked");
  });

  it("unlocks a rapor period", async () => {
    server.use(
      http.post("*/api/v1/admin/rapor-periods/:id/unlock", () =>
        HttpResponse.json({ id: 1, status: "open" }),
      ),
    );
    const res = await smsApi.unlockPeriod(1);
    expect(res.status).toBe("open");
  });

  it("generates a rapor PDF", async () => {
    let captured: unknown;
    server.use(
      http.post("*/api/v1/admin/rapor/generate", async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json(
          { id: 10, storage_key: "rapor/2026-2027/ganjil/1-123.pdf", file_size: 4096 },
          { status: 201 },
        );
      }),
    );
    const res = await smsApi.generateRapor({ student_id: 1, rapor_period_id: 2 });
    expect(captured).toEqual({ student_id: 1, rapor_period_id: 2 });
    expect(res.storage_key).toBe("rapor/2026-2027/ganjil/1-123.pdf");
  });

  it("lists rapor documents", async () => {
    server.use(
      http.get("*/api/v1/admin/rapor/documents", () =>
        HttpResponse.json({
          documents: [
            {
              id: 10,
              student_id: 1,
              student_name: "Aisyah",
              rapor_period_id: 2,
              semester: "ganjil",
              storage_key: "rapor/2026-2027/ganjil/1-123.pdf",
              file_size: 4096,
              finalized_at: "2026-08-16T08:00:00.000Z",
            },
          ],
        }),
      ),
    );
    const res = await smsApi.listRaporDocuments();
    expect(res.documents[0]).toMatchObject({ file_size: 4096, semester: "ganjil" });
  });

  it("provisions a parent and returns the flat 201 body", async () => {
    let captured: unknown;
    server.use(
      http.post("*/api/v1/admin/users/parents", async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json(
          {
            id: 9,
            email: "ibu@example.com",
            initial_password: "Sandi12345",
            must_change_password: true,
          },
          { status: 201 },
        );
      }),
    );
    const res = await smsApi.provisionParent({
      email: "ibu@example.com",
      full_name: "Ibu Siti",
      initial_password: "Sandi12345",
    });
    expect(captured).toEqual({ email: "ibu@example.com", full_name: "Ibu Siti", initial_password: "Sandi12345" });
    expect(res).toEqual({
      id: 9,
      email: "ibu@example.com",
      initial_password: "Sandi12345",
      must_change_password: true,
    });
  });

  it("resets a parent password with a new_password body", async () => {
    let captured: unknown;
    server.use(
      http.post("*/api/v1/admin/users/:id/reset-password", async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ ok: true, must_change_password: true });
      }),
    );
    const res = await smsApi.resetParentPassword(4, "Baru12345");
    expect(captured).toEqual({ new_password: "Baru12345" });
    expect(res).toEqual({ ok: true, must_change_password: true });
  });
});
