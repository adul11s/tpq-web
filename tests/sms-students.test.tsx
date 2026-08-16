import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server, API_BASE, contentListHandler, CLASS_ROWS } from "./msw-server";
import { StudentsScreen } from "@/components/admin/sms/StudentsScreen";
import { GuardianshipsPanel } from "@/components/admin/sms/GuardianshipsPanel";
import type { Guardianship, SmsStudent } from "@/lib/api/sms";

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
  nis: null,
  full_name: "Bilal",
  birth_date: "2019-05-01",
  gender: "laki-laki",
  class: null,
};

const LINK: Guardianship = {
  id: 10,
  user_id: 9,
  parent_email: "ibu.aisyah@example.com",
  student_id: 1,
  student_name: "Aisyah",
  relation: "ibu",
};

const YEAR = { id: 7, name: "2026/2027", is_active: true };

function screenHandlers(
  students: SmsStudent[],
  guardianships: Guardianship[]
) {
  return [
    http.get(`${API_BASE}/admin/students`, () =>
      HttpResponse.json({ students })
    ),
    http.get(`${API_BASE}/admin/guardianships`, () =>
      HttpResponse.json({ guardianships })
    ),
    contentListHandler("classes", CLASS_ROWS),
    http.get(`${API_BASE}/admin/academic-years`, () =>
      HttpResponse.json({ academic_years: [YEAR] })
    ),
  ];
}

describe("StudentsScreen", () => {
  it("renders student rows with NIS, class, parent link status and actions", async () => {
    server.use(...screenHandlers([AISYAH, BILAL], [LINK]));
    render(<StudentsScreen />);

    expect(await screen.findByText("Aisyah")).toBeInTheDocument();
    expect(screen.getByText("Bilal")).toBeInTheDocument();
    expect(screen.getByText("TPQ-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("TK Qur'ani Bintang")).toBeInTheDocument();
    expect(screen.getByText("ibu.aisyah@example.com")).toBeInTheDocument();
    expect(screen.getByText("Belum ditautkan")).toBeInTheDocument();

    const aisyahRow = screen.getByRole("row", { name: /Aisyah/ });
    expect(
      within(aisyahRow).getByRole("button", { name: "Tautkan Ortu" })
    ).toBeInTheDocument();
    expect(
      within(aisyahRow).getByRole("button", { name: "Edit" })
    ).toBeInTheDocument();
    expect(
      within(aisyahRow).getByRole("button", { name: "Hapus" })
    ).toBeInTheDocument();
  });

  it("creates a student posting a snake_case body and enrolls in the chosen class", async () => {
    const students: SmsStudent[] = [BILAL];
    let posted: unknown;
    let enrolled: unknown;
    server.use(
      ...screenHandlers(students, []),
      http.post(`${API_BASE}/admin/students`, async ({ request }) => {
        posted = await request.json();
        const body = posted as { full_name: string };
        students.push({
          id: 3,
          nis: null,
          full_name: body.full_name,
          birth_date: null,
          gender: null,
          class: null,
        });
        return HttpResponse.json({ id: 3, full_name: body.full_name }, { status: 201 });
      }),
      http.post(`${API_BASE}/admin/enrollments`, async ({ request }) => {
        enrolled = await request.json();
        return HttpResponse.json({ id: 5 }, { status: 201 });
      })
    );
    const user = userEvent.setup();
    render(<StudentsScreen />);

    await screen.findByText("Bilal");
    await user.click(screen.getByRole("button", { name: "Tambah Santri" }));

    await user.type(screen.getByLabelText(/nama lengkap/i), "Bilal Ahmad");
    await user.selectOptions(screen.getByLabelText(/^kelas$/i), "2");

    await user.click(screen.getByRole("button", { name: /simpan/i }));

    await waitFor(() =>
      expect(posted).toEqual({ full_name: "Bilal Ahmad" })
    );
    expect(enrolled).toEqual({
      student_id: 3,
      class_id: 2,
      academic_year_id: 7,
    });
    expect(await screen.findByText("Bilal Ahmad")).toBeInTheDocument();
    expect(
      screen.getByText(/santri disimpan/i)
    ).toBeInTheDocument();
  });

  it("blocks submit when full_name is missing without calling the API", async () => {
    const onRequest = vi.fn();
    server.use(
      ...screenHandlers([AISYAH], []),
      http.post(`${API_BASE}/admin/students`, ({ request }) => {
        onRequest(request);
        return HttpResponse.json({ id: 3, full_name: "X" }, { status: 201 });
      })
    );
    const user = userEvent.setup();
    render(<StudentsScreen />);

    await screen.findByText("Aisyah");
    await user.click(screen.getByRole("button", { name: "Tambah Santri" }));
    await user.click(screen.getByRole("button", { name: /simpan/i }));

    expect(
      screen.getByText("Nama lengkap wajib diisi")
    ).toBeInTheDocument();
    expect(onRequest).not.toHaveBeenCalled();
  });

  it("deletes a student after confirmation and the row disappears", async () => {
    const students: SmsStudent[] = [AISYAH, BILAL];
    let deletedId: string | null = null;
    server.use(
      ...screenHandlers(students, [LINK]),
      http.delete(`${API_BASE}/admin/students/:id`, ({ params }) => {
        deletedId = params.id as string;
        students.splice(
          students.findIndex((s) => s.id === Number(params.id)),
          1
        );
        return HttpResponse.json({ ok: true });
      })
    );
    const user = userEvent.setup();
    render(<StudentsScreen />);

    await screen.findByText("Aisyah");
    const aisyahRow = screen.getByRole("row", { name: /Aisyah/ });
    await user.click(within(aisyahRow).getByRole("button", { name: "Hapus" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Aisyah/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Konfirmasi" }));

    await waitFor(() => expect(deletedId).toBe("1"));
    await waitFor(() =>
      expect(screen.queryByText("Aisyah")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Bilal")).toBeInTheDocument();
  });
});

describe("GuardianshipsPanel", () => {
  it("lists links, unlinks via DELETE and links a parent via POST { user_id, student_id }", async () => {
    let posted: unknown;
    let deletedId: string | null = null;
    const onChanged = vi.fn();
    server.use(
      http.get(`${API_BASE}/admin/users`, () =>
        HttpResponse.json({
          users: [
            {
              id: 9,
              email: "ibu.aisyah@example.com",
              full_name: "Ibu Aisyah",
              role: "parent",
              is_active: true,
              has_2fa: false,
            },
            {
              id: 11,
              email: "ayah.bilal@example.com",
              full_name: "Ayah Bilal",
              role: "parent",
              is_active: true,
              has_2fa: false,
            },
          ],
        })
      ),
      http.post(`${API_BASE}/admin/guardianships`, async ({ request }) => {
        posted = await request.json();
        return HttpResponse.json({ id: 11 }, { status: 201 });
      }),
      http.delete(`${API_BASE}/admin/guardianships/:id`, ({ params }) => {
        deletedId = params.id as string;
        return HttpResponse.json({ ok: true });
      })
    );
    const user = userEvent.setup();
    render(
      <GuardianshipsPanel
        student={AISYAH}
        guardianships={[LINK]}
        onChanged={onChanged}
        onClose={() => undefined}
      />
    );

    expect(screen.getByText("ibu.aisyah@example.com")).toBeInTheDocument();
    expect(screen.getByText("ibu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Lepas" }));
    await waitFor(() => expect(deletedId).toBe("10"));
    expect(onChanged).toHaveBeenCalledTimes(1);

    await user.type(
      screen.getByLabelText(/cari email/i),
      "ayah.bilal"
    );
    await user.click(
      await screen.findByRole("button", { name: "Tautkan" })
    );
    await waitFor(() =>
      expect(posted).toEqual({ user_id: 11, student_id: 1 })
    );
    expect(onChanged).toHaveBeenCalledTimes(2);
  });
});
