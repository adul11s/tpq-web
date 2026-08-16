import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server, API_BASE, contentListHandler, CLASS_ROWS } from "./msw-server";
import { HafalanRecorder } from "@/components/admin/sms/HafalanRecorder";
import type { Enrollment, HafalanRecord, HafalanTarget } from "@/lib/api/sms";

const TARGETS: HafalanTarget[] = [
  { id: 1, level: "tk", surah_name: "Al-Fatihah", sort_order: 0 },
  { id: 2, level: "tk", surah_name: "An-Nas", sort_order: 1 },
  { id: 3, level: "tpa", surah_name: "Al-Baqarah", sort_order: 0 },
];

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

const REC_TUNTAS: HafalanRecord = {
  id: 20,
  student_id: 1,
  student_name: "Aisyah",
  surah_name: "Al-Fatihah",
  status: "tuntas",
  fluency: "lancar",
  updated_by: 3,
  updated_at: "2026-08-10T08:00:00Z",
};

function screenHandlers(
  records: HafalanRecord[],
  enrollments: Enrollment[] = [ENR_AISYAH, ENR_BILAL]
) {
  return [
    http.get(`${API_BASE}/admin/hafalan-targets`, () =>
      HttpResponse.json({ targets: TARGETS })
    ),
    http.get(`${API_BASE}/admin/hafalan`, () =>
      HttpResponse.json({ records })
    ),
    http.get(`${API_BASE}/admin/enrollments`, () =>
      HttpResponse.json({ enrollments })
    ),
    contentListHandler("classes", CLASS_ROWS),
  ];
}

function hafalanPutHandler(records: HafalanRecord[], putBodies: unknown[]) {
  return http.put(`${API_BASE}/admin/hafalan`, async ({ request }) => {
    const body = (await request.json()) as {
      student_id: number;
      surah_name: string;
      status: HafalanRecord["status"];
      fluency?: "lancar" | "kurang_lancar";
    };
    putBodies.push(body);
    const existing = records.find(
      (r) =>
        r.student_id === body.student_id && r.surah_name === body.surah_name
    );
    const next: HafalanRecord = {
      id: existing?.id ?? 99,
      student_id: body.student_id,
      student_name: existing?.student_name ?? "Aisyah",
      surah_name: body.surah_name,
      status: body.status,
      fluency: body.fluency ?? null,
      updated_by: 3,
      updated_at: "2026-08-16T08:00:00Z",
    };
    if (existing) {
      const index = records.findIndex((r) => r.id === existing.id);
      records[index] = next;
    } else {
      records.push(next);
    }
    return HttpResponse.json({
      id: next.id,
      student_id: next.student_id,
      surah_name: next.surah_name,
      status: next.status,
      fluency: next.fluency,
    });
  });
}

describe("HafalanRecorder", () => {
  it("renders the per-class grid: student rows x surah columns for the class level", async () => {
    server.use(...screenHandlers([REC_TUNTAS]));
    render(<HafalanRecorder />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    expect(within(table).getByText("Bilal")).toBeInTheDocument();
    expect(within(table).getAllByText("Al-Fatihah").length).toBeGreaterThan(0);
    expect(within(table).getAllByText("An-Nas").length).toBeGreaterThan(0);
    expect(within(table).queryByText("Al-Baqarah")).not.toBeInTheDocument();

    const combobox = screen.getByRole("combobox", { name: /kelas/i });
    expect(combobox).toHaveValue("1");
    expect(within(combobox).getAllByRole("option").length).toBe(2);

    const aisyahRow = within(table).getByRole("row", { name: /Aisyah/ });
    const alFatihahCell = within(aisyahRow).getByRole("button", {
      name: /Al-Fatihah.*Aisyah.*Tuntas/,
    });
    expect(alFatihahCell).toHaveAttribute("title", "Diperbarui oleh #3");
    expect(
      within(aisyahRow).getByRole("button", { name: /kelancaran/i })
    ).toHaveTextContent("Lancar");
    expect(
      within(aisyahRow).getByRole("button", {
        name: /An-Nas.*Aisyah.*Belum/,
      })
    ).toBeInTheDocument();
    expect(within(table).getAllByRole("button", { name: /Belum/ }).length).toBe(
      3
    );
  });

  it("cycles a cell to sedang, PUTs { student_id, surah_name, status } and the chip updates", async () => {
    const records: HafalanRecord[] = [];
    const putBodies: unknown[] = [];
    server.use(...screenHandlers(records), hafalanPutHandler(records, putBodies));
    const user = userEvent.setup();
    render(<HafalanRecorder />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    const aisyahRow = within(table).getByRole("row", { name: /Aisyah/ });
    await user.click(
      within(aisyahRow).getByRole("button", { name: /Al-Fatihah.*Belum/ })
    );

    await waitFor(() =>
      expect(putBodies).toEqual([
        { student_id: 1, surah_name: "Al-Fatihah", status: "sedang" },
      ])
    );
    expect(
      within(aisyahRow).getByRole("button", {
        name: /Al-Fatihah.*Aisyah.*Sedang/,
      })
    ).toBeInTheDocument();
  });

  it("tuntas reveals the fluency toggle and toggling PUTs the fluency", async () => {
    const records: HafalanRecord[] = [];
    const putBodies: unknown[] = [];
    server.use(...screenHandlers(records), hafalanPutHandler(records, putBodies));
    const user = userEvent.setup();
    render(<HafalanRecorder />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    const aisyahRow = within(table).getByRole("row", { name: /Aisyah/ });

    await user.click(
      within(aisyahRow).getByRole("button", { name: /Al-Fatihah.*Belum/ })
    );
    await waitFor(() =>
      expect(
        within(aisyahRow).getByRole("button", {
          name: /Al-Fatihah.*Aisyah.*Sedang/,
        })
      ).toBeInTheDocument()
    );
    await user.click(
      within(aisyahRow).getByRole("button", { name: /Al-Fatihah.*Aisyah.*Sedang/ })
    );

    const fluencyToggle = await within(aisyahRow).findByRole("button", {
      name: /kelancaran/i,
    });
    expect(fluencyToggle).toHaveTextContent("Lancar");
    await user.click(fluencyToggle);

    await waitFor(() =>
      expect(putBodies).toEqual([
        { student_id: 1, surah_name: "Al-Fatihah", status: "sedang" },
        {
          student_id: 1,
          surah_name: "Al-Fatihah",
          status: "tuntas",
          fluency: "lancar",
        },
        {
          student_id: 1,
          surah_name: "Al-Fatihah",
          status: "tuntas",
          fluency: "kurang_lancar",
        },
      ])
    );
    expect(
      within(aisyahRow).getByRole("button", { name: /kelancaran/i })
    ).toHaveTextContent("Kurang lancar");
  });

  it("hides the class picker for the teacher role and shows the class name", async () => {
    server.use(...screenHandlers([]));
    render(<HafalanRecorder role="teacher" />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("TK Qur'ani Bintang")).toBeInTheDocument();
  });
});
