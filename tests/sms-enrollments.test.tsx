import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server, API_BASE, contentListHandler, CLASS_ROWS } from "./msw-server";
import { EnrollmentsScreen } from "@/components/admin/sms/EnrollmentsScreen";
import type { AcademicYear, Enrollment, SmsStudent } from "@/lib/api/sms";

const AISYAH: SmsStudent = {
  id: 1,
  nis: "TPQ-2026-0001",
  full_name: "Aisyah",
  birth_date: null,
  gender: "perempuan",
  class: "TK Qur'ani Bintang",
};

const BILAL: SmsStudent = {
  id: 2,
  nis: "TPQ-2026-0002",
  full_name: "Bilal",
  birth_date: null,
  gender: "laki-laki",
  class: "TPA Qur'ani Bintang",
};

const HASAN: SmsStudent = {
  id: 3,
  nis: "TPQ-2026-0003",
  full_name: "Hasan",
  birth_date: null,
  gender: "laki-laki",
  class: null,
};

const YEAR_ACTIVE: AcademicYear = { id: 7, name: "2026/2027", is_active: true };
const YEAR_OLD: AcademicYear = { id: 6, name: "2025/2026", is_active: false };

const ENR_AISYAH: Enrollment = {
  id: 10,
  student_id: 1,
  student_name: "Aisyah",
  class_id: 1,
  class_code: "TK",
  academic_year_id: 7,
  status: "active",
};

const ENR_BILAL: Enrollment = {
  id: 11,
  student_id: 2,
  student_name: "Bilal",
  class_id: 2,
  class_code: "TPA",
  academic_year_id: 7,
  status: "active",
};

function screenHandlers(
  enrollments: Enrollment[],
  students: SmsStudent[],
  years: AcademicYear[]
) {
  return [
    http.get(`${API_BASE}/admin/enrollments`, () =>
      HttpResponse.json({ enrollments })
    ),
    http.get(`${API_BASE}/admin/students`, () =>
      HttpResponse.json({ students })
    ),
    contentListHandler("classes", CLASS_ROWS),
    http.get(`${API_BASE}/admin/academic-years`, () =>
      HttpResponse.json({ academic_years: years })
    ),
  ];
}

describe("EnrollmentsScreen", () => {
  it("renders enrollment rows with student, class and academic year", async () => {
    server.use(
      ...screenHandlers([ENR_AISYAH, ENR_BILAL], [AISYAH, BILAL], [
        YEAR_ACTIVE,
        YEAR_OLD,
      ])
    );
    render(<EnrollmentsScreen />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    expect(within(table).getByText("Bilal")).toBeInTheDocument();
    expect(within(table).getByText("TK Qur'ani Bintang")).toBeInTheDocument();
    expect(within(table).getByText("TPA Qur'ani Bintang")).toBeInTheDocument();
    expect(within(table).getAllByText("2026/2027").length).toBeGreaterThan(0);
    expect(within(table).getAllByText("Aktif").length).toBeGreaterThan(0);
  });

  it("creates an enrollment posting { student_id, class_id, academic_year_id } and the row appears", async () => {
    const enrollments: Enrollment[] = [ENR_BILAL];
    let posted: unknown;
    server.use(
      ...screenHandlers(enrollments, [AISYAH, BILAL, HASAN], [YEAR_ACTIVE]),
      http.post(`${API_BASE}/admin/enrollments`, async ({ request }) => {
        posted = await request.json();
        enrollments.push({
          id: 12,
          student_id: 3,
          student_name: "Hasan",
          class_id: 2,
          class_code: "TPA",
          academic_year_id: 7,
          status: "active",
        });
        return HttpResponse.json({ id: 12 }, { status: 201 });
      })
    );
    const user = userEvent.setup();
    render(<EnrollmentsScreen />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Bilal")).toBeInTheDocument()
    );
    await user.selectOptions(screen.getByLabelText(/^santri/i), "3");
    await user.selectOptions(screen.getByLabelText(/^kelas/i), "2");
    await user.selectOptions(
      screen.getByLabelText(/^tahun ajaran \*/i),
      "7"
    );
    await user.click(screen.getByRole("button", { name: /daftarkan/i }));

    await waitFor(() =>
      expect(posted).toEqual({
        student_id: 3,
        class_id: 2,
        academic_year_id: 7,
      })
    );
    await waitFor(() =>
      expect(within(table).getByText("Hasan")).toBeInTheDocument()
    );
    expect(screen.getByText(/pendaftaran berhasil/i)).toBeInTheDocument();
  });

  it("deletes an enrollment via DELETE /admin/enrollments/:id after confirmation and the row disappears", async () => {
    const enrollments: Enrollment[] = [ENR_AISYAH, ENR_BILAL];
    let deletedId: string | null = null;
    server.use(
      ...screenHandlers(enrollments, [AISYAH, BILAL], [YEAR_ACTIVE]),
      http.delete(`${API_BASE}/admin/enrollments/:id`, ({ params }) => {
        deletedId = params.id as string;
        enrollments.splice(
          enrollments.findIndex((e) => e.id === Number(params.id)),
          1
        );
        return HttpResponse.json({ ok: true });
      })
    );
    const user = userEvent.setup();
    render(<EnrollmentsScreen />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    const aisyahRow = within(table).getByRole("row", { name: /Aisyah/ });
    await user.click(
      within(aisyahRow).getByRole("button", { name: "Hapus" })
    );

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("heading", {
        name: /hapus pendaftaran aisyah/i,
      })
    ).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Konfirmasi" })
    );

    await waitFor(() => expect(deletedId).toBe("10"));
    await waitFor(() =>
      expect(within(table).queryByText("Aisyah")).not.toBeInTheDocument()
    );
    expect(within(table).getByText("Bilal")).toBeInTheDocument();
  });

  it("renders the Aktif badge on the active academic year in the year select", async () => {
    server.use(
      ...screenHandlers([], [], [YEAR_ACTIVE, YEAR_OLD])
    );
    render(<EnrollmentsScreen />);

    const yearSelect = await screen.findByRole("combobox", {
      name: /tahun ajaran/i,
    });
    expect(within(yearSelect).getByText(/Aktif/)).toBeInTheDocument();
    expect(
      within(yearSelect).getByText("2025/2026")
    ).toBeInTheDocument();
  });

  it("creates an academic year via the inline form and it becomes selectable", async () => {
    const years: AcademicYear[] = [YEAR_ACTIVE, YEAR_OLD];
    let posted: unknown;
    server.use(
      ...screenHandlers([], [], years),
      http.post(`${API_BASE}/admin/academic-years`, async ({ request }) => {
        posted = await request.json();
        years.push({ id: 8, name: "2027/2028", is_active: false });
        return HttpResponse.json({ id: 8, name: "2027/2028" }, { status: 201 });
      })
    );
    const user = userEvent.setup();
    render(<EnrollmentsScreen />);

    const yearInput = await screen.findByLabelText(/tahun ajaran baru/i);
    await user.type(yearInput, "2027/2028");
    await user.click(
      screen.getByRole("button", { name: /tambah tahun ajaran/i })
    );

    await waitFor(() => expect(posted).toEqual({ name: "2027/2028" }));
    const yearSelect = screen.getByRole("combobox", {
      name: /tahun ajaran/i,
    });
    await waitFor(() =>
      expect(within(yearSelect).getByText("2027/2028")).toBeInTheDocument()
    );
  });
});
