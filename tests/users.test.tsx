import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  server,
  adminMeAs,
  usersListHandler,
  userReset2faHandler,
  userDeactivateHandler,
  userActivateHandler,
} from "./msw-server";
import { SessionProvider } from "../src/lib/admin/session";
import UsersPage from "../src/app/admin/pengguna/page";
import { menuForRole } from "../src/lib/admin/menu";
import type { AdminUser } from "../src/lib/types/admin";

const { mockReplace } = vi.hoisted(() => ({ mockReplace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/pengguna",
}));

const USERS: AdminUser[] = [
  {
    id: 1,
    email: "admin@tpq-qurani.example.id",
    full_name: "Ustadz Admin",
    role: "admin",
    is_active: true,
    has_2fa: true,
  },
  {
    id: 2,
    email: "konten@tpq-qurani.example.id",
    full_name: "Ustadzah Konten",
    role: "content_manager",
    is_active: true,
    has_2fa: false,
  },
  {
    id: 3,
    email: "nonaktif@tpq-qurani.example.id",
    full_name: "Ustadz Nonaktif",
    role: "content_manager",
    is_active: false,
    has_2fa: true,
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

describe("Users management", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockReplace.mockClear();
  });

  it("renders users with role, status and 2FA badges plus the audit note", async () => {
    server.use(usersListHandler(USERS));
    renderPage();

    expect(
      await screen.findByText("admin@tpq-qurani.example.id")
    ).toBeInTheDocument();
    expect(screen.getByText("konten@tpq-qurani.example.id")).toBeInTheDocument();
    expect(screen.getByText("Ustadzah Konten")).toBeInTheDocument();
    expect(screen.getByText("Ustadz Nonaktif")).toBeInTheDocument();

    expect(
      within(rowOf("admin@")).getByText("Administrator")
    ).toBeInTheDocument();
    expect(
      within(rowOf("konten@")).getByText("Pengelola Konten")
    ).toBeInTheDocument();
    expect(
      within(rowOf("nonaktif@")).getByText("Pengelola Konten")
    ).toBeInTheDocument();

    expect(within(rowOf("admin@")).getByText("Aktif")).toBeInTheDocument();
    expect(within(rowOf("nonaktif@")).getByText("Nonaktif")).toBeInTheDocument();

    expect(within(rowOf("admin@")).getByText("2FA aktif")).toBeInTheDocument();
    expect(within(rowOf("konten@")).getByText("\u2014")).toBeInTheDocument();

    expect(
      screen.getByText("Semua tindakan tercatat di Aktivitas")
    ).toBeInTheDocument();
  });

  it("resets 2FA after confirmation, POSTs with CSRF and shows the success message", async () => {
    const onRequest = vi.fn();
    server.use(usersListHandler(USERS), userReset2faHandler(onRequest));
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("admin@tpq-qurani.example.id");
    await user.click(
      within(rowOf("konten@")).getByRole("button", { name: "Reset 2FA" })
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/daftar ulang/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Konfirmasi" }));

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    const request = onRequest.mock.calls[0][0] as Request;
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe(
      "/api/v1/admin/users/2/reset-2fa"
    );
    expect(request.headers.get("x-csrf-token")).toBe("abc123");

    expect(
      screen.getByText("2FA direset, pengguna harus daftar ulang")
    ).toBeInTheDocument();
  });

  it("deactivates a user after confirmation, noting sessions are ended", async () => {
    const onRequest = vi.fn();
    server.use(usersListHandler(USERS), userDeactivateHandler(USERS, onRequest));
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("admin@tpq-qurani.example.id");
    await user.click(
      within(rowOf("konten@")).getByRole("button", { name: "Nonaktifkan" })
    );

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(/sesi pengguna akan diakhiri/i)
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Konfirmasi" }));

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    const request = onRequest.mock.calls[0][0] as Request;
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe(
      "/api/v1/admin/users/2/deactivate"
    );
    expect(request.headers.get("x-csrf-token")).toBe("abc123");

    await waitFor(() => {
      expect(within(rowOf("konten@")).getByText("Nonaktif")).toBeInTheDocument();
    });
    expect(
      within(rowOf("konten@")).getByRole("button", { name: "Aktifkan kembali" })
    ).toBeInTheDocument();
  });

  it("reactivates a deactivated user after confirmation", async () => {
    const onRequest = vi.fn();
    server.use(usersListHandler(USERS), userActivateHandler(USERS, onRequest));
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("admin@tpq-qurani.example.id");
    await user.click(
      within(rowOf("nonaktif@")).getByRole("button", {
        name: "Aktifkan kembali",
      })
    );

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Konfirmasi" }));

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    const request = onRequest.mock.calls[0][0] as Request;
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe(
      "/api/v1/admin/users/3/activate"
    );
    expect(request.headers.get("x-csrf-token")).toBe("abc123");

    await waitFor(() => {
      expect(within(rowOf("nonaktif@")).getByText("Aktif")).toBeInTheDocument();
    });
    expect(
      within(rowOf("nonaktif@")).getByRole("button", { name: "Nonaktifkan" })
    ).toBeInTheDocument();
  });

  it("blocks non-admin: menu hidden and route guard redirects", async () => {
    server.use(adminMeAs("content_manager"));
    renderPage();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
    expect(
      screen.getByText("Halaman ini khusus untuk admin.")
    ).toBeInTheDocument();

    const hrefs = menuForRole("content_manager").map((item) => item.href);
    expect(hrefs).not.toContain("/admin/pengguna");
    expect(hrefs).toContain("/admin/inquiry");
  });

  it("disables actions on the signed-in account row", async () => {
    server.use(usersListHandler(USERS));
    renderPage();

    await screen.findByText("admin@tpq-qurani.example.id");
    expect(
      within(rowOf("admin@")).getByRole("button", { name: "Reset 2FA" })
    ).toBeDisabled();
    expect(
      within(rowOf("admin@")).getByRole("button", { name: "Nonaktifkan" })
    ).toBeDisabled();
    expect(
      within(rowOf("konten@")).getByRole("button", { name: "Reset 2FA" })
    ).toBeEnabled();
  });
});
