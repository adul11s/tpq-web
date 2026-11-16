import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { adminMeAs, server } from "./msw-server";
import { SessionProvider } from "@/lib/admin/session";
import MulaiPage from "@/app/admin/mulai/page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/mulai",
}));

function setupHandlers() {
  return [
    http.get("*/api/admin/students", () =>
      HttpResponse.json({ students: [{ id: 1, full_name: "Aisyah" }] }),
    ),
    http.get("*/api/admin/enrollments", () =>
      HttpResponse.json({
        enrollments: [{ id: 1, student_id: 1, status: "active" }],
      }),
    ),
    http.get("*/api/admin/guardianships", () =>
      HttpResponse.json({ guardianships: [] }),
    ),
    http.get("*/api/admin/hafalan", () =>
      HttpResponse.json({ records: [{ id: 1, student_id: 1 }] }),
    ),
    http.get("*/api/admin/rapor-periods", () =>
      HttpResponse.json({ periods: [] }),
    ),
  ];
}

function renderPage() {
  return render(
    <SessionProvider>
      <MulaiPage />
    </SessionProvider>,
  );
}

describe("Panduan Setup", () => {
  it("shows readiness from existing operational data and links unfinished steps", async () => {
    server.use(...setupHandlers());
    renderPage();

    expect(await screen.findByText("3 dari 5 langkah")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "3");

    const parentStep = screen
      .getByRole("heading", { name: "Siapkan akses orang tua" })
      .closest("li")!;
    expect(parentStep).toHaveTextContent("Belum selesai");
    expect(within(parentStep).getByRole("link", { name: "Buka" })).toHaveAttribute(
      "href",
      "/admin/pengguna",
    );

    const hafalanStep = screen
      .getByRole("heading", { name: "Catat hafalan pertama" })
      .closest("li")!;
    expect(hafalanStep).toHaveTextContent("Selesai");
  });

  it("keeps available progress visible when one check fails", async () => {
    server.use(...setupHandlers());
    server.use(
      http.get("*/api/admin/guardianships", () =>
        HttpResponse.json({ error: "Internal server error" }, { status: 500 }),
      ),
    );
    renderPage();

    expect(
      await screen.findByText(/Sebagian progres tidak dapat diperiksa: Akun wali/),
    ).toBeInTheDocument();
    expect(screen.getByText("3 dari 5 langkah")).toBeInTheDocument();
  });

  it("confirms when all setup steps are complete", async () => {
    server.use(...setupHandlers());
    server.use(
      http.get("*/api/admin/guardianships", () =>
        HttpResponse.json({ guardianships: [{ id: 1, student_id: 1 }] }),
      ),
      http.get("*/api/admin/rapor-periods", () =>
        HttpResponse.json({ periods: [{ id: 1, status: "open" }] }),
      ),
    );
    renderPage();

    expect(await screen.findByText("5 dari 5 langkah")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Setup dasar selesai. Dashboard operasional siap digunakan.",
      ),
    ).toBeInTheDocument();
  });

  it("blocks non-admin roles without loading setup data", async () => {
    server.use(adminMeAs("content_manager"));
    renderPage();

    expect(
      await screen.findByText("Panduan setup hanya tersedia untuk admin."),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Memeriksa kesiapan operasional…")).toBeNull(),
    );
  });
});
