import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server, API_BASE, contentListHandler, CLASS_ROWS } from "./msw-server";
import { AttendanceGrid } from "@/components/admin/sms/AttendanceGrid";
import type { AttendanceRow, Enrollment } from "@/lib/api/sms";

function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

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
  class_id: 1,
  class_code: "TK",
  academic_year_id: 7,
  status: "active",
};

function screenHandlers(
  attendance: AttendanceRow[],
  enrollments: Enrollment[] = [ENR_AISYAH, ENR_BILAL]
) {
  return [
    http.get(`*/api/admin/attendance`, () =>
      HttpResponse.json({ attendance })
    ),
    http.get(`*/api/admin/enrollments`, () =>
      HttpResponse.json({ enrollments })
    ),
    contentListHandler("classes", CLASS_ROWS),
  ];
}

function attendancePostHandler(postBodies: unknown[]) {
  return http.post(`*/api/admin/attendance`, async ({ request }) => {
    const body = (await request.json()) as {
      class_id: number;
      date: string;
      records: Array<{ enrollment_id: number; status: string }>;
    };
    postBodies.push(body);
    return HttpResponse.json({ ok: true, saved: body.records.length });
  });
}

function chipText(label: string, count: number) {
  return screen.getByText(
    (_content: string, element?: Element | null) =>
      element?.tagName === "P" && element.textContent === `${label}: ${count}`
  );
}

describe("AttendanceGrid", () => {
  it("renders the per-class table: student rows with hadir/izin/sakit/alpa selects, date defaulting to today", async () => {
    server.use(...screenHandlers([]));
    render(<AttendanceGrid />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    expect(within(table).getByText("Bilal")).toBeInTheDocument();

    expect(screen.getByLabelText("Tanggal")).toHaveValue(todayLocal());
    const classSelect = screen.getByRole("combobox", { name: /kelas/i });
    expect(classSelect).toHaveValue("1");

    const aisyahRow = within(table).getByRole("row", { name: /Aisyah/ });
    const aisyahStatus = within(aisyahRow).getByRole("combobox");
    expect(aisyahStatus).toHaveValue("hadir");
    expect(within(aisyahStatus).getAllByRole("option").length).toBe(4);
    expect(aisyahStatus).toHaveTextContent("Hadir");
    expect(aisyahStatus).toHaveTextContent("Izin");
    expect(aisyahStatus).toHaveTextContent("Sakit");
    expect(aisyahStatus).toHaveTextContent("Alpa");
    expect(chipText("Hadir", 2)).toBeInTheDocument();
  });

  it("posts the batch { class_id, date, records } with ALL rows when saving", async () => {
    const postBodies: unknown[] = [];
    server.use(
      ...screenHandlers([]),
      attendancePostHandler(postBodies)
    );
    const user = userEvent.setup();
    render(<AttendanceGrid />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    const saveButton = screen.getByRole("button", { name: /Simpan Absensi/ });
    await waitFor(() => expect(saveButton).toBeEnabled());
    const aisyahRow = within(table).getByRole("row", { name: /Aisyah/ });
    await user.selectOptions(
      within(aisyahRow).getByRole("combobox"),
      "izin"
    );
    await user.click(saveButton);

    await waitFor(() =>
      expect(postBodies).toEqual([
        {
          class_id: 1,
          date: todayLocal(),
          records: [
            { enrollment_id: 10, status: "izin" },
            { enrollment_id: 11, status: "hadir" },
          ],
        },
      ])
    );
    expect(
      screen.getByText("Absensi tersimpan")
    ).toBeInTheDocument();
  });

  it("recomputes the summary chips from local state before saving", async () => {
    server.use(...screenHandlers([]));
    const user = userEvent.setup();
    render(<AttendanceGrid />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    const saveButton = screen.getByRole("button", { name: /Simpan Absensi/ });
    await waitFor(() => expect(saveButton).toBeEnabled());
    const aisyahRow = within(table).getByRole("row", { name: /Aisyah/ });
    await user.selectOptions(
      within(aisyahRow).getByRole("combobox"),
      "sakit"
    );

    expect(chipText("Sakit", 1)).toBeInTheDocument();
    expect(chipText("Hadir", 1)).toBeInTheDocument();
  });

  it("loads previously saved statuses for the date into the selects", async () => {
    const today = todayLocal();
    const attendance: AttendanceRow[] = [
      {
        enrollment_id: 10,
        student_name: "Aisyah",
        date: today,
        status: "sakit",
        note: null,
      },
      {
        enrollment_id: 11,
        student_name: "Bilal",
        date: today,
        status: "hadir",
        note: null,
      },
    ];
    server.use(...screenHandlers(attendance));
    render(<AttendanceGrid />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    const saveButton = screen.getByRole("button", { name: /Simpan Absensi/ });
    await waitFor(() => expect(saveButton).toBeEnabled());
    const aisyahRow = within(table).getByRole("row", { name: /Aisyah/ });
    const bilalRow = within(table).getByRole("row", { name: /Bilal/ });
    expect(within(aisyahRow).getByRole("combobox")).toHaveValue("sakit");
    expect(within(bilalRow).getByRole("combobox")).toHaveValue("hadir");
  });

  it("never posts stale drafts when the date changes while attendance is still loading", async () => {
    const postBodies: unknown[] = [];
    let releaseSecondGet!: () => void;
    const secondGetGate = new Promise<void>((resolve) => {
      releaseSecondGet = resolve;
    });
    let getCalls = 0;

    server.use(
      http.get(`*/api/admin/attendance`, () => {
        getCalls += 1;
        if (getCalls === 1) {
          return HttpResponse.json({ attendance: [] });
        }
        return secondGetGate.then(() =>
          HttpResponse.json({
            attendance: [
              {
                enrollment_id: 10,
                student_name: "Aisyah",
                date: "2026-08-02",
                status: "hadir",
                note: null,
              },
              {
                enrollment_id: 11,
                student_name: "Bilal",
                date: "2026-08-02",
                status: "hadir",
                note: null,
              },
            ],
          })
        );
      }),
      http.get(`*/api/admin/enrollments`, () =>
        HttpResponse.json({ enrollments: [ENR_AISYAH, ENR_BILAL] })
      ),
      contentListHandler("classes", CLASS_ROWS),
      attendancePostHandler(postBodies)
    );

    const user = userEvent.setup();
    render(<AttendanceGrid />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    const saveButton = screen.getByRole("button", { name: /Simpan Absensi/ });
    await waitFor(() => expect(saveButton).toBeEnabled());

    fireEvent.change(screen.getByLabelText("Tanggal"), {
      target: { value: "2026-08-02" },
    });

    await waitFor(() => expect(saveButton).toBeDisabled());
    await user.click(saveButton);
    expect(postBodies).toEqual([]);

    releaseSecondGet();
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);

    await waitFor(() =>
      expect(postBodies).toEqual([
        {
          class_id: 1,
          date: "2026-08-02",
          records: [
            { enrollment_id: 10, status: "hadir" },
            { enrollment_id: 11, status: "hadir" },
          ],
        },
      ])
    );
  });

  it("hides the class picker for the teacher role and shows the class name", async () => {
    server.use(...screenHandlers([]));
    render(<AttendanceGrid role="teacher" />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    expect(screen.queryByRole("combobox", { name: /kelas/i })).not.toBeInTheDocument();
    expect(screen.getByText("TK Qur'ani Bintang")).toBeInTheDocument();
  });
});
