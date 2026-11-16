import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  server,
  adminMeAs,
  inquiriesListHandler,
  inquiryUpdateHandler,
  inquiriesCsvHandler,
  classesPublicHandler,
} from "./msw-server";
import { SessionProvider } from "../src/lib/admin/session";
import InquiryPage from "../src/app/admin/inquiry/page";
import type { AdminInquiry } from "../src/lib/types/admin";

const OLD = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
const FRESH = new Date(Date.now() - 60 * 60 * 1000).toISOString();

const INQUIRIES: AdminInquiry[] = [
  {
    id: 1,
    parent_name: "Ibu Siti Rahma",
    phone: "081234567801",
    whatsapp: null,
    child_age: "6 tahun",
    program_class_id: 1,
    message: "Bagaimana jadwal kelas TK?",
    status: "new",
    admin_note: null,
    handled_by: null,
    created_at: OLD,
  },
  {
    id: 2,
    parent_name: "Bapak Dimas",
    phone: "081234567802",
    whatsapp: "085212345678",
    child_age: "9 tahun",
    program_class_id: 2,
    message: "Apakah ada kelas sore?",
    status: "new",
    admin_note: null,
    handled_by: 3,
    created_at: FRESH,
  },
  {
    id: 3,
    parent_name: null,
    phone: null,
    whatsapp: null,
    child_age: null,
    program_class_id: null,
    message: null,
    status: "closed",
    admin_note: null,
    handled_by: null,
    created_at: OLD,
  },
  {
    id: 4,
    parent_name: "Ibu Ayu",
    phone: "081234567804",
    whatsapp: null,
    child_age: "5 tahun",
    program_class_id: 1,
    message: "Sudah mendaftar",
    status: "enrolled",
    admin_note: null,
    handled_by: 1,
    created_at: FRESH,
  },
];

function renderPage() {
  return render(
    <SessionProvider>
      <InquiryPage />
    </SessionProvider>
  );
}

describe("Inquiry inbox", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
  });

  it("prioritizes the oldest new lead and shows conversion and SLA summaries", async () => {
    server.use(
      inquiriesListHandler([
        INQUIRIES[1],
        INQUIRIES[0],
        INQUIRIES[2],
        INQUIRIES[3],
      ]),
      classesPublicHandler(),
    );
    renderPage();

    expect(await screen.findByText("Ibu Siti Rahma")).toBeInTheDocument();
    expect(screen.getByText("Bapak Dimas")).toBeInTheDocument();
    expect(screen.getByText("081234567801")).toBeInTheDocument();
    expect(screen.getByText("6 tahun")).toBeInTheDocument();
    expect(screen.getByText("TK")).toBeInTheDocument();
    expect(screen.getByText("Bagaimana jadwal kelas TK?")).toBeInTheDocument();
    expect(screen.getByText("Ditangani oleh: #3")).toBeInTheDocument();
    expect(
      within(screen.getByRole("table")).getAllByText("Lewat SLA 24 jam"),
    ).toHaveLength(1);
    expect(screen.getByText("2 hari menunggu")).toBeInTheDocument();

    const summary = screen.getByRole("region", {
      name: "Ringkasan konversi inquiry",
    });
    expect(summary).toHaveTextContent("Perlu follow-up2");
    expect(summary).toHaveTextContent("Lewat SLA 24 jam1");
    expect(summary).toHaveTextContent("Menjadi santri1");

    const rows = screen.getAllByRole("row").map((row) => row.textContent ?? "");
    expect(rows.findIndex((row) => row.includes("Ibu Siti Rahma"))).toBeLessThan(
      rows.findIndex((row) => row.includes("Bapak Dimas")),
    );

    expect(screen.getByRole("button", { name: "Baru 2" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      screen.getByRole("button", { name: "Sudah dihubungi 0" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Ditutup 1" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.queryByText("Dianonimkan")).not.toBeInTheDocument();
  });

  it("filters the pipeline and links enrolled leads to student creation", async () => {
    server.use(inquiriesListHandler(INQUIRIES), classesPublicHandler());
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Ibu Siti Rahma");
    await user.click(screen.getByRole("button", { name: "Ditutup 1" }));

    expect(screen.getByText("Dianonimkan")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Terdaftar 1" }));
    expect(screen.getByText("Ibu Ayu")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Buat data santri" }),
    ).toHaveAttribute("href", "/admin/sms/students");
  });

  it("changes status via PATCH with CSRF header and moves the row between tabs", async () => {
    const onRequest = vi.fn();
    server.use(
      inquiriesListHandler(INQUIRIES),
      classesPublicHandler(),
      inquiryUpdateHandler(INQUIRIES, onRequest)
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Ibu Siti Rahma");
    await user.selectOptions(
      screen.getByLabelText("Status Ibu Siti Rahma"),
      "contacted"
    );

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    const [request, body] = onRequest.mock.calls[0] as [
      Request,
      { status?: string },
    ];
    expect(request.method).toBe("PATCH");
    expect(new URL(request.url).pathname).toBe("/api/admin/inquiries/1");
    expect(request.headers.get("x-csrf-token")).toBe("abc123");
    expect(body).toEqual({ status: "contacted" });

    expect(screen.getByRole("button", { name: "Baru 1" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sudah dihubungi 1" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Ibu Siti Rahma")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Sudah dihubungi 1" }),
    );
    expect(screen.getByText("Ibu Siti Rahma")).toBeInTheDocument();
  });

  it("saves the admin note via PATCH with CSRF header", async () => {
    const onRequest = vi.fn();
    server.use(
      inquiriesListHandler(INQUIRIES),
      classesPublicHandler(),
      inquiryUpdateHandler(INQUIRIES, onRequest)
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Ibu Siti Rahma");
    await user.type(
      screen.getByLabelText("Catatan admin untuk Ibu Siti Rahma"),
      "Hubungi besok pagi"
    );
    await user.click(
      screen.getByRole("button", { name: "Simpan Catatan untuk Ibu Siti Rahma" })
    );

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    const [request, body] = onRequest.mock.calls[0] as [
      Request,
      { admin_note?: string },
    ];
    expect(new URL(request.url).pathname).toBe("/api/admin/inquiries/1");
    expect(request.headers.get("x-csrf-token")).toBe("abc123");
    expect(body).toEqual({ admin_note: "Hubungi besok pagi" });
  });

  it("builds personalized wa.me follow-up links and prefers whatsapp over phone", async () => {
    server.use(inquiriesListHandler(INQUIRIES), classesPublicHandler());
    renderPage();

    await screen.findByText("Ibu Siti Rahma");
    const links = screen.getAllByRole("link", {
      name: "WhatsApp & tandai dihubungi",
    });
    expect(links).toHaveLength(2);

    const hrefs = links.map((link) => ({
      raw: link.getAttribute("href") ?? "",
      url: new URL(link.getAttribute("href") ?? ""),
    }));
    expect(hrefs[0].url.host).toBe("wa.me");
    expect(hrefs[0].url.pathname).toBe("/6281234567801");
    expect(hrefs[0].raw).toContain("%20");
    const text0 = hrefs[0].url.searchParams.get("text") ?? "";
    expect(text0).toContain("Ibu Siti Rahma");
    expect(text0).toContain("Minat kelas: TK");
    expect(text0).toContain("6 tahun");
    expect(text0).toContain("Bagaimana jadwal kelas TK?");
    expect(text0).toContain("proses pendaftarannya");
    expect(links[0]).toHaveAttribute("target", "_blank");

    expect(hrefs[1].url.pathname).toBe("/6285212345678");
    const text1 = hrefs[1].url.searchParams.get("text") ?? "";
    expect(text1).toContain("9 tahun");
    expect(text1).toContain("Apakah ada kelas sore?");
  });

  it("marks a new lead as contacted when WhatsApp follow-up is opened", async () => {
    const onRequest = vi.fn();
    server.use(
      inquiriesListHandler(INQUIRIES),
      classesPublicHandler(),
      inquiryUpdateHandler(INQUIRIES, onRequest),
    );
    const user = userEvent.setup();
    renderPage();

    const links = await screen.findAllByRole("link", {
      name: "WhatsApp & tandai dihubungi",
    });
    await user.click(links[0]);

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    expect(onRequest.mock.calls[0][1]).toEqual({ status: "contacted" });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Baru 1" })).toBeInTheDocument(),
    );
  });

  it("hides the export button for content managers", async () => {
    server.use(
      adminMeAs("content_manager"),
      inquiriesListHandler(INQUIRIES),
      classesPublicHandler()
    );
    renderPage();

    await screen.findByText("Ibu Siti Rahma");
    expect(
      screen.queryByRole("button", { name: "Ekspor CSV" })
    ).not.toBeInTheDocument();
  });

  it("lets admins download the CSV via fetch blob + object URL click", async () => {
    const onExport = vi.fn();
    const createObjectUrl = vi.fn(() => "blob:mock-csv");
    const revokeObjectUrl = vi.fn();
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    URL.createObjectURL =
      createObjectUrl as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeObjectUrl as unknown as typeof URL.revokeObjectURL;
    server.use(
      inquiriesListHandler(INQUIRIES),
      classesPublicHandler(),
      inquiriesCsvHandler(onExport)
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Ibu Siti Rahma");
    await user.click(screen.getByRole("button", { name: "Ekspor CSV" }));

    await waitFor(() => expect(onExport).toHaveBeenCalledTimes(1));
    const request = onExport.mock.calls[0][0] as Request;
    expect(new URL(request.url).pathname).toBe(
      "/api/admin/inquiries/export.csv"
    );
    expect(request.credentials).toBe("include");
    expect(request.headers.get("x-csrf-token")).toBeNull();
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect((createObjectUrl.mock.calls[0] as unknown as [Blob])[0]).toBeInstanceOf(Blob);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:mock-csv");
  });
});
