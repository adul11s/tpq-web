import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server, API_BASE, usersListHandler } from "./msw-server";
import { SessionProvider } from "../src/lib/admin/session";
import UsersPage from "../src/app/admin/pengguna/page";
import type { AdminUser } from "../src/lib/types/admin";

const { mockReplace } = vi.hoisted(() => ({ mockReplace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/pengguna",
}));

const PARENTS: AdminUser[] = [
  {
    id: 1,
    email: "admin@tpq-qurani.example.id",
    full_name: "Ustadz Admin",
    role: "admin",
    is_active: true,
    has_2fa: true,
  },
  {
    id: 4,
    email: "ibu.aisyah@example.com",
    full_name: "Ibu Aisyah",
    role: "parent",
    is_active: true,
    has_2fa: false,
  },
  {
    id: 5,
    email: "ayah.bilal@example.com",
    full_name: "Ayah Bilal",
    role: "parent",
    is_active: true,
    has_2fa: false,
  },
];

function rowOf(email: string): HTMLElement {
  return screen.getByRole("row", { name: new RegExp(email) });
}

function renderPage() {
  return render(
    <SessionProvider>
      <UsersPage />
    </SessionProvider>
  );
}

describe("Parent provisioning and reset", () => {
  it("shows the Orang Tua label and Reset Sandi action on parent rows", async () => {
    server.use(usersListHandler(PARENTS));
    renderPage();

    await screen.findByText("ibu.aisyah@example.com");

    expect(
      within(rowOf("ibu.aisyah@")).getByText("Orang Tua")
    ).toBeInTheDocument();
    expect(
      within(rowOf("ibu.aisyah@")).getByRole("button", { name: "Reset Sandi" })
    ).toBeInTheDocument();
  });

  it("provisions a parent, then shows the one-time password and WhatsApp handoff", async () => {
    let posted: Record<string, unknown> | undefined;
    const user = userEvent.setup();
    server.use(
      usersListHandler(PARENTS),
      http.post(`${API_BASE}/admin/users/parents`, async ({ request }) => {
        posted = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            id: 7,
            email: "ibu.aisyah@example.com",
            initial_password: "S3lalu#Am1n!",
            must_change_password: true,
          },
          { status: 201 }
        );
      })
    );
    renderPage();

    await screen.findByText("ibu.aisyah@example.com");
    await user.click(screen.getByRole("button", { name: "Tambah Orang Tua" }));

    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/email/i),
      "ibu.aisyah@example.com"
    );
    await user.type(
      within(dialog).getByLabelText(/nama lengkap/i),
      "Ibu Aisyah Baru"
    );
    await user.click(
      within(dialog).getByRole("button", { name: /buat akun/i })
    );

    await waitFor(() => expect(posted?.email).toBe("ibu.aisyah@example.com"));
    expect(posted?.full_name).toBe("Ibu Aisyah Baru");
    expect(String(posted?.initial_password).length).toBeGreaterThanOrEqual(8);

    const passwordBox = await screen.findByDisplayValue("S3lalu#Am1n!");
    expect(passwordBox).toHaveAttribute("readonly");

    const link = screen.getByRole("link", { name: /whatsapp/i });
    const linkText = decodeURIComponent((link as HTMLAnchorElement).href);
    expect(linkText).toContain("ibu.aisyah@example.com");
    expect(linkText).toContain("S3lalu#Am1n!");
  });

  it("resets a parent password posting new_password and ends old sessions", async () => {
    let resetId: string | null = null;
    let postedBody: unknown;
    const user = userEvent.setup();
    server.use(
      usersListHandler(PARENTS),
      http.post(
        `${API_BASE}/admin/users/:id/reset-password`,
        async ({ request, params }) => {
          resetId = params.id as string;
          postedBody = await request.json();
          return HttpResponse.json({ ok: true, must_change_password: true });
        }
      )
    );
    renderPage();

    await screen.findByText("ibu.aisyah@example.com");
    await user.click(
      within(rowOf("ibu.aisyah@")).getByRole("button", { name: "Reset Sandi" })
    );

    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/kata sandi baru/i),
      "BaruSandi#12"
    );
    await user.click(within(dialog).getByRole("button", { name: "Konfirmasi" }));

    await waitFor(() => expect(resetId).toBe("4"));
    expect(postedBody).toEqual({ new_password: "BaruSandi#12" });
    expect(
      screen.getByText("Password direset, sesi lama diakhiri")
    ).toBeInTheDocument();
  });

  it("does not offer Reset Sandi on non-parent rows", async () => {
    server.use(
      usersListHandler([
        PARENTS[0],
        {
          id: 2,
          email: "konten@tpq-qurani.example.id",
          full_name: "Ustadzah Konten",
          role: "content_manager",
          is_active: true,
          has_2fa: false,
        },
      ])
    );
    renderPage();

    await screen.findByText("konten@tpq-qurani.example.id");
    expect(
      within(rowOf("konten@")).queryByRole("button", { name: "Reset Sandi" })
    ).not.toBeInTheDocument();
    expect(
      within(rowOf("admin@")).queryByRole("button", { name: "Reset Sandi" })
    ).not.toBeInTheDocument();
  });
});