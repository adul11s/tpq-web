import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import {
  server,
  adminMeOk,
  adminMeAs,
  API_BASE,
  contentListHandler,
  contentListError,
  contentUpdateHandler,
  inquiriesListHandler,
} from "./msw-server";
import { SessionProvider } from "../src/lib/admin/session";
import { AppShell } from "../src/components/admin/AppShell";
import DashboardPage from "../src/app/admin/dashboard/page";
import PengaturanPage from "../src/app/admin/pengaturan/page";
import { menuForRole } from "../src/lib/admin/menu";
import type { AdminInquiry } from "../src/lib/types/admin";

const { mockPush, mockReplace } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/dashboard",
}));

function monthIso(monthsAgo: number): string {
  const d = new Date();
  d.setDate(15);
  d.setHours(8, 0, 0, 0);
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString();
}

const RESOURCES: Record<string, unknown>[] = [
  { id: 1, title: "Materi A", download_count: 1, published_at: monthIso(1) },
  { id: 2, title: "Materi B", download_count: 5, published_at: monthIso(0) },
  { id: 3, title: "Materi C", download_count: 3, published_at: monthIso(0) },
  { id: 4, title: "Materi D", download_count: 9, published_at: monthIso(0) },
  { id: 5, title: "Materi E", download_count: 7, published_at: monthIso(1) },
  { id: 6, title: "Materi F", download_count: 2, published_at: monthIso(0) },
];

function cardOf(heading: HTMLElement): HTMLElement {
  return heading.closest("div")!;
}

function mockDashboardData() {
  server.use(
    http.get(`*/api/admin/resources`, ({ request }) => {
      const status = new URL(request.url).searchParams.get("status");
      return HttpResponse.json({
        resources: status === "draft" ? [] : RESOURCES,
      });
    }),
    inquiriesListHandler([
      { id: 1, status: "new" },
      { id: 2, status: "new" },
      { id: 3, status: "new" },
    ] as AdminInquiry[]),
    contentListHandler("classes", [{ id: 1, status: "draft" }]),
    contentListHandler("prayer_guides", [{ id: 2, status: "draft" }]),
    contentListHandler("pages", []),
    contentListHandler("teachers", []),
    contentListHandler("testimonials", []),
    contentListHandler("faqs", [])
  );
}

function renderDashboard() {
  return render(
    <SessionProvider>
      <DashboardPage />
    </SessionProvider>
  );
}

const SETTINGS_ROWS: Record<string, unknown>[] = [
  {
    id: 1,
    key: "address",
    value: "Jl. Contoh No. 1",
    description: "Alamat TPQ",
    updated_by: 1,
    updated_at: "2026-08-01T08:00:00Z",
  },
  {
    id: 2,
    key: "privacy_policy_version",
    value: "1.2",
    description: "Versi kebijakan privasi yang disetujui orang tua",
    updated_by: 1,
    updated_at: "2026-08-01T08:00:00Z",
  },
];

function renderPengaturan() {
  return render(
    <SessionProvider>
      <PengaturanPage />
    </SessionProvider>
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockReplace.mockClear();
    mockPush.mockClear();
  });

  it("computes Total Unduhan, Top 5 Materi, Inquiry count, pending drafts and new-this-month from API data", async () => {
    mockDashboardData();
    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Total Unduhan" })
      ).toBeInTheDocument();
    });

    const totalCard = cardOf(
      screen.getByRole("heading", { name: "Total Unduhan" })
    );
    expect(totalCard).toHaveTextContent("27");
    expect(totalCard).toHaveTextContent("per counter, bukan GA4");

    const top5 = cardOf(screen.getByRole("heading", { name: "Top 5 Materi" }));
    const topItems = within(top5).getAllByRole("listitem");
    expect(topItems.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Materi D"),
      expect.stringContaining("Materi E"),
      expect.stringContaining("Materi B"),
      expect.stringContaining("Materi C"),
      expect.stringContaining("Materi F"),
    ]);
    expect(top5).not.toHaveTextContent("Materi A");
    expect(top5).toHaveTextContent("9 unduhan");
    expect(top5).not.toHaveTextContent("1 unduhan");

    const inquiryCard = cardOf(
      screen.getByRole("heading", { name: "Inquiry Belum Dibalas" })
    );
    expect(inquiryCard).toHaveTextContent("3");

    const pendingCard = cardOf(
      screen.getByRole("heading", { name: "Menunggu Persetujuan" })
    );
    expect(pendingCard).toHaveTextContent("2");

    const freshCard = cardOf(
      screen.getByRole("heading", { name: "Materi Baru Bulan Ini" })
    );
    expect(freshCard).toHaveTextContent("4");

    const ga4Card = cardOf(
      screen.getByRole("heading", { name: "Pengunjung (GA4)" })
    );
    expect(ga4Card).toHaveTextContent("tersedia setelah GA4 terpasang");
  });

  it("shows the red badge with the new-inquiries count on the Inquiry menu item", async () => {
    server.use(
      inquiriesListHandler([
        { id: 1, status: "new" },
        { id: 2, status: "new" },
      ] as AdminInquiry[])
    );
    render(
      <SessionProvider>
        <AppShell>
          <div />
        </AppShell>
      </SessionProvider>
    );

    const inquiryLink = await screen.findByRole("link", { name: /Inquiry/ });
    await waitFor(() => {
      expect(within(inquiryLink).getByText("2")).toBeInTheDocument();
    });
  });

  it("does not show a badge when there are no new inquiries", async () => {
    server.use(inquiriesListHandler([] as AdminInquiry[]));
    render(
      <SessionProvider>
        <AppShell>
          <div />
        </AppShell>
      </SessionProvider>
    );

    const inquiryLink = await screen.findByRole("link", { name: /Inquiry/ });
    await waitFor(() => {
      expect(within(inquiryLink).queryByText("2")).not.toBeInTheDocument();
    });
  });

  it("zeroes stats for a non-CMS role (teacher) instead of showing CMS numbers", async () => {
    server.use(adminMeAs("teacher"));
    mockDashboardData();
    renderDashboard();

    // Cards render once the session probe resolves; teacher is gated to
    // zeroed stats, never the mocked CMS numbers.
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Total Unduhan" })
      ).toBeInTheDocument();
    });
    const totalCard = cardOf(
      screen.getByRole("heading", { name: "Total Unduhan" })
    );
    expect(totalCard).toHaveTextContent("0");
    expect(totalCard).not.toHaveTextContent("27");
    expect(screen.queryByText("Memuat…")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("still renders stats with a warning when one draft entity fails to load", async () => {
    mockDashboardData();
    server.use(contentListError("teachers"));
    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Total Unduhan" })
      ).toBeInTheDocument();
    });
    const pendingCard = cardOf(
      screen.getByRole("heading", { name: "Menunggu Persetujuan" })
    );
    expect(pendingCard).toHaveTextContent("2");
    expect(
      screen.getByText(/Sebagian data gagal dimuat: Guru/i)
    ).toBeInTheDocument();
  });

  it("adds Pengaturan to the admin menu only", () => {
    const adminHrefs = menuForRole("admin").map((item) => item.href);
    expect(adminHrefs).toContain("/admin/pengaturan");
    expect(
      menuForRole("content_manager").map((item) => item.href)
    ).not.toContain("/admin/pengaturan");
  });
});

describe("Pengaturan (site settings)", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockReplace.mockClear();
    mockPush.mockClear();
  });

  it("shows per-key descriptions and warns when editing privacy_policy_version", async () => {
    server.use(
      adminMeOk,
      contentListHandler("site_settings", SETTINGS_ROWS)
    );
    renderPengaturan();

    expect(await screen.findByText("Alamat TPQ")).toBeInTheDocument();
    expect(
      screen.getByText(
        /perubahan memaksa ulang persetujuan orang tua/i
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nilai address")).toHaveValue('"Jl. Contoh No. 1"');
  });

  it("rejects invalid JSON inline without sending PATCH, then saves parsed JSON", async () => {
    const onRequest = vi.fn();
    server.use(
      adminMeOk,
      contentListHandler("site_settings", SETTINGS_ROWS),
      contentUpdateHandler("site_settings", onRequest)
    );
    const user = userEvent.setup();
    renderPengaturan();

    const textarea = await screen.findByLabelText("Nilai address");
    await user.clear(textarea);
    await user.type(textarea, "not json");
    await user.click(screen.getByRole("button", { name: /Simpan address/ }));

    expect(
      await screen.findByText(/JSON tidak valid/)
    ).toBeInTheDocument();
    expect(onRequest).not.toHaveBeenCalled();

    await user.clear(textarea);
    await user.type(textarea, '"Jl. Baru No. 2"');
    await user.click(screen.getByRole("button", { name: /Simpan address/ }));

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    const body = onRequest.mock.calls[0][1] as { value?: unknown };
    expect(body).toEqual({ value: "Jl. Baru No. 2" });
  });
});
