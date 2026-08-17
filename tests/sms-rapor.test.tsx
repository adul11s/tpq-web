import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server, API_BASE } from "./msw-server";
import { RaporBuilder } from "@/components/admin/sms/RaporBuilder";
import type {
  AcademicYear,
  Enrollment,
  RaporDocument,
  RaporPeriod,
} from "@/lib/api/sms";

const YEARS: AcademicYear[] = [
  { id: 7, name: "2025/2026", is_active: true },
  { id: 8, name: "2026/2027", is_active: false },
];

const PERIOD_OPEN: RaporPeriod = {
  id: 1,
  academic_year_id: 7,
  academic_year: "2025/2026",
  semester: "ganjil",
  status: "open",
};

const PERIOD_LOCKED: RaporPeriod = {
  id: 2,
  academic_year_id: 7,
  academic_year: "2025/2026",
  semester: "genap",
  status: "locked",
};

const CRITERIA = [
  { id: 1, name: "Kedisiplinan", sort_order: 1 },
  { id: 2, name: "Kejujuran", sort_order: 2 },
  { id: 3, name: "Sopan Santun", sort_order: 3 },
  { id: 4, name: "Semangat Belajar", sort_order: 4 },
  { id: 5, name: "Tanggung Jawab", sort_order: 5 },
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
  class_id: 3,
  class_code: "PAUD",
  academic_year_id: 7,
  status: "active",
};

const DOC_AISYAH: RaporDocument = {
  id: 20,
  student_id: 1,
  student_name: "Aisyah",
  rapor_period_id: 1,
  semester: "ganjil",
  storage_key: "rapor/2025-2026/ganjil/1-1.pdf",
  file_size: 4096,
  finalized_at: "2026-08-16T08:00:00.000Z",
};

function freshPeriods(): RaporPeriod[] {
  return [
    { ...PERIOD_OPEN },
    { ...PERIOD_LOCKED },
  ];
}

function screenHandlers({
  periods,
  enrollments = [ENR_AISYAH, ENR_BILAL],
  ratings = [],
  documents = [],
}: {
  periods: RaporPeriod[];
  enrollments?: Enrollment[];
  ratings?: Array<{
    id: number;
    student_id: number;
    rapor_period_id: number;
    criterion_id: number;
    score: number;
  }>;
  documents?: RaporDocument[];
}) {
  return [
    http.get(`${API_BASE}/admin/rapor-periods`, () =>
      HttpResponse.json({ periods })
    ),
    http.get(`${API_BASE}/admin/academic-years`, () =>
      HttpResponse.json({ academic_years: YEARS })
    ),
    http.get(`${API_BASE}/admin/adab-criteria`, () =>
      HttpResponse.json({ criteria: CRITERIA })
    ),
    http.get(`${API_BASE}/admin/enrollments`, () =>
      HttpResponse.json({ enrollments })
    ),
    http.get(`${API_BASE}/admin/adab-ratings`, () =>
      HttpResponse.json({ ratings })
    ),
    http.get(`${API_BASE}/admin/rapor/documents`, () =>
      HttpResponse.json({ documents })
    ),
  ];
}

function periodLockHandler(periods: RaporPeriod[], lockIds: number[]) {
  return http.post(`${API_BASE}/admin/rapor-periods/:id/lock`, ({ params }) => {
    const id = Number(params.id);
    lockIds.push(id);
    const period = periods.find((p) => p.id === id);
    if (period) period.status = "locked";
    return HttpResponse.json({ id, status: "locked" });
  });
}

describe("RaporBuilder", () => {
  it("renders periods with Terbuka/Terkunci status and the create form", async () => {
    server.use(...screenHandlers({ periods: freshPeriods() }));
    render(<RaporBuilder />);

    expect(
      await screen.findByRole("button", { name: "Buat Periode" })
    ).toBeInTheDocument();
    expect(screen.getByText("2025/2026 \u00b7 Ganjil")).toBeInTheDocument();
    expect(screen.getByText("2025/2026 \u00b7 Genap")).toBeInTheDocument();
    expect(screen.getByText("Terbuka")).toBeInTheDocument();
    expect(screen.getByText("Terkunci")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Kunci" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buka" })).toBeInTheDocument();
  });

  it("creates a period via POST /admin/rapor-periods with { academic_year_id, semester }", async () => {
    const createBodies: unknown[] = [];
    const periods = freshPeriods();
    server.use(
      ...screenHandlers({ periods }),
      http.post(`${API_BASE}/admin/rapor-periods`, async ({ request }) => {
        createBodies.push(await request.json());
        return HttpResponse.json({ id: 99, status: "open" }, { status: 201 });
      })
    );
    const user = userEvent.setup();
    render(<RaporBuilder />);

    const yearSelect = await screen.findByLabelText(/Tahun Ajaran/);
    await user.selectOptions(yearSelect, "8");
    await user.selectOptions(screen.getByLabelText(/Semester/), "genap");
    await user.click(screen.getByRole("button", { name: "Buat Periode" }));

    await waitFor(() =>
      expect(createBodies).toEqual([
        { academic_year_id: 8, semester: "genap" },
      ])
    );
  });

  it("Kunci opens a confirm dialog then POSTs /admin/rapor-periods/:id/lock and the badge updates", async () => {
    const periods = freshPeriods();
    const lockIds: number[] = [];
    server.use(
      ...screenHandlers({ periods }),
      periodLockHandler(periods, lockIds)
    );
    const user = userEvent.setup();
    render(<RaporBuilder />);

    await user.click(await screen.findByRole("button", { name: "Kunci" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(/Kunci periode 2025\/2026 \u00b7 Ganjil/)
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /Konfirmasi/ }));

    await waitFor(() => expect(lockIds).toEqual([1]));
    expect(
      await within(
        (await screen.findByText("2025/2026 \u00b7 Ganjil")).closest("li")!
      ).findByText("Terkunci")
    ).toBeInTheDocument();
  });

  it("TK/TPA student shows the 5 adab criteria pickers and PUTs { student_id, rapor_period_id, ratings }", async () => {
    const putBodies: unknown[] = [];
    server.use(
      ...screenHandlers({
        periods: freshPeriods(),
        ratings: [
          {
            id: 1,
            student_id: 1,
            rapor_period_id: 1,
            criterion_id: 1,
            score: 3,
          },
        ],
      }),
      http.put(`${API_BASE}/admin/adab-ratings`, async ({ request }) => {
        putBodies.push(await request.json());
        return HttpResponse.json({ ok: true });
      })
    );
    const user = userEvent.setup();
    render(<RaporBuilder />);

    expect(
      await screen.findByLabelText("Kedisiplinan")
    ).toBeInTheDocument();
    for (const name of ["Kejujuran", "Sopan Santun", "Semangat Belajar", "Tanggung Jawab"]) {
      expect(screen.getByLabelText(name)).toBeInTheDocument();
    }
    await waitFor(() =>
      expect(screen.getByLabelText("Kedisiplinan")).toHaveValue("3")
    );

    await user.selectOptions(screen.getByLabelText("Kedisiplinan"), "4");

    await waitFor(() =>
      expect(putBodies).toEqual([
        {
          student_id: 1,
          rapor_period_id: 1,
          ratings: [{ criterion_id: 1, scale: 4 }],
        },
      ])
    );
  });

  it("rapid adab changes: a stale in-flight failure cannot overwrite the latest selection", async () => {
    let releaseFirst: (() => void) | undefined;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const putBodies: unknown[] = [];
    server.use(
      ...screenHandlers({
        periods: freshPeriods(),
        ratings: [
          {
            id: 1,
            student_id: 1,
            rapor_period_id: 1,
            criterion_id: 1,
            score: 3,
          },
        ],
      }),
      http.put(`${API_BASE}/admin/adab-ratings`, async ({ request }) => {
        putBodies.push(await request.json());
        if (putBodies.length === 1) {
          await firstGate;
          return HttpResponse.error();
        }
        return HttpResponse.json({ ok: true });
      })
    );
    render(<RaporBuilder />);

    const picker = await screen.findByLabelText("Kedisiplinan");
    await waitFor(() => expect(picker).toHaveValue("3"));

    fireEvent.change(picker, { target: { value: "4" } });
    fireEvent.change(picker, { target: { value: "2" } });

    await waitFor(() => expect(putBodies).toHaveLength(2));
    await waitFor(() => expect(picker).toHaveValue("2"));
    expect(
      screen.getByText("Nilai adab disimpan (1 kriteria)")
    ).toBeInTheDocument();

    releaseFirst!();
    await waitFor(() =>
      expect(screen.getByLabelText("Kedisiplinan")).toHaveValue("2")
    );
    expect(screen.queryByText("Terjadi kesalahan")).not.toBeInTheDocument();
  });

  it("PAUD student shows the Narasi Perkembangan textarea and no adab pickers", async () => {
    server.use(...screenHandlers({ periods: freshPeriods() }));
    const user = userEvent.setup();
    render(<RaporBuilder />);

    await screen.findByLabelText(/Santri/);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Bilal" })).toBeInTheDocument()
    );
    await user.selectOptions(screen.getByLabelText(/Santri/), "2");

    expect(
      await screen.findByLabelText(/Narasi Perkembangan/)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Kedisiplinan")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Kejujuran")).not.toBeInTheDocument();
  });

  it("switching from a PAUD student to a TK student clears narrative+comment; generate on TK omits narrative", async () => {
    const generateBodies: unknown[] = [];
    server.use(
      ...screenHandlers({ periods: freshPeriods() }),
      http.post(`${API_BASE}/admin/rapor/generate`, async ({ request }) => {
        generateBodies.push(await request.json());
        return HttpResponse.json(
          { id: 31, storage_key: "rapor/2025-2026/ganjil/1-9.pdf", file_size: 5120 },
          { status: 201 }
        );
      })
    );
    const user = userEvent.setup();
    render(<RaporBuilder />);

    await screen.findByLabelText(/Santri/);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Bilal" })).toBeInTheDocument()
    );
    await user.selectOptions(screen.getByLabelText(/Santri/), "2");
    await user.type(
      await screen.findByLabelText(/Narasi Perkembangan/),
      "Narasi PAUD yang tidak boleh bocor ke TK."
    );
    await user.type(screen.getByLabelText(/Catatan Guru/), "Komentar PAUD.");

    await user.selectOptions(screen.getByLabelText(/Santri/), "1");

    expect(screen.queryByLabelText(/Narasi Perkembangan/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Kedisiplinan")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText(/Catatan Guru/)).toHaveValue("")
    );

    await user.click(screen.getByRole("button", { name: /\bGenerate\b/ }));

    await waitFor(() =>
      expect(generateBodies).toEqual([
        { student_id: 1, rapor_period_id: 1, teacher_comment: "" },
      ])
    );
    expect(JSON.stringify(generateBodies[0])).not.toContain("narrative");
  });

  it("switching the period clears comment and narrative for the new selection", async () => {
    server.use(...screenHandlers({ periods: freshPeriods() }));
    const user = userEvent.setup();
    render(<RaporBuilder />);

    await screen.findByLabelText(/Periode/);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /Bilal/ })).toBeInTheDocument()
    );
    await user.selectOptions(screen.getByLabelText(/Santri/), "2");
    await user.type(
      await screen.findByLabelText(/Narasi Perkembangan/),
      "Narasi ganjil."
    );
    await user.type(screen.getByLabelText(/Catatan Guru/), "Komentar ganjil.");
    await waitFor(() =>
      expect(screen.getByLabelText(/Catatan Guru/)).toHaveValue("Komentar ganjil.")
    );

    await user.selectOptions(screen.getByLabelText(/Periode/), "2");

    await waitFor(() =>
      expect(screen.getByLabelText(/Catatan Guru/)).toHaveValue("")
    );
    expect(screen.getByLabelText(/Narasi Perkembangan/)).toHaveValue("");
  });

  it("Generate POSTs { student_id, rapor_period_id, teacher_comment, narrative } with the current inputs", async () => {
    const generateBodies: unknown[] = [];
    server.use(
      ...screenHandlers({ periods: freshPeriods() }),
      http.post(`${API_BASE}/admin/rapor/generate`, async ({ request }) => {
        generateBodies.push(await request.json());
        return HttpResponse.json(
          {
            id: 30,
            storage_key: "rapor/2025-2026/ganjil/2-8.pdf",
            file_size: 5120,
          },
          { status: 201 }
        );
      })
    );
    const user = userEvent.setup();
    render(<RaporBuilder />);

    await screen.findByLabelText(/Santri/);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Bilal" })).toBeInTheDocument()
    );
    await user.selectOptions(screen.getByLabelText(/Santri/), "2");
    await user.type(
      await screen.findByLabelText(/Narasi Perkembangan/),
      "Belajar dengan gembira dan mandiri."
    );
    await user.type(
      screen.getByLabelText(/Catatan Guru/),
      "Terus tingkatkan semangat belajarnya."
    );

    const generateButton = screen.getByRole("button", { name: /\bGenerate\b/ });
    await waitFor(() =>
      expect(generateButton).toBeEnabled()
    );
    await user.click(generateButton);

    await waitFor(() =>
      expect(generateBodies).toEqual([
        {
          student_id: 2,
          rapor_period_id: 1,
          teacher_comment: "Terus tingkatkan semangat belajarnya.",
          narrative: "Belajar dengan gembira dan mandiri.",
        },
      ])
    );
  });

  it("renders the document row and Unduh calls GET /admin/rapor/documents/:id/download then opens the presigned URL", async () => {
    const downloaded: number[] = [];
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    server.use(
      ...screenHandlers({
        periods: freshPeriods(),
        documents: [DOC_AISYAH],
      }),
      http.get(
        `${API_BASE}/admin/rapor/documents/:id/download`,
        ({ params }) => {
          downloaded.push(Number(params.id));
          return HttpResponse.json({
            download_url:
              "https://presigned.example/rapor.pdf?X-Amz-Signature=abc123",
          });
        }
      )
    );
    const user = userEvent.setup();
    render(<RaporBuilder />);

    const table = await screen.findByRole("table");
    await waitFor(() =>
      expect(within(table).getByText("Aisyah")).toBeInTheDocument()
    );
    expect(within(table).getByText("4.0 KB")).toBeInTheDocument();
    expect(within(table).getByText("16/08/2026")).toBeInTheDocument();

    await user.click(
      within(table).getByRole("button", { name: /Unduh/ })
    );

    await waitFor(() => expect(downloaded).toEqual([20]));
    expect(openSpy).toHaveBeenCalledWith(
      "https://presigned.example/rapor.pdf?X-Amz-Signature=abc123",
      "_blank"
    );
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});