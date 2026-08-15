import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server, adminMeOk, API_BASE } from "./msw-server";
import { SessionProvider } from "../src/lib/admin/session";
import { AppShell } from "../src/components/admin/AppShell";

const { mockRedirectToLogin, mockConfirm, mockReload } = vi.hoisted(() => ({
  mockRedirectToLogin: vi.fn(),
  mockConfirm: vi.fn(),
  mockReload: vi.fn(),
}));

vi.mock("../src/lib/admin/redirect", () => ({
  redirectToLogin: mockRedirectToLogin,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/inquiry",
}));

function renderShell() {
  return render(
    <SessionProvider>
      <AppShell>
        <div />
      </AppShell>
    </SessionProvider>
  );
}

function stubLocation(pathname: string) {
  Object.defineProperty(window, "location", {
    value: {
      pathname,
      get href() {
        return `http://localhost:3000${pathname}`;
      },
      set href(_value: string) {},
      reload: mockReload,
    },
    configurable: true,
    writable: true,
  });
}

describe("session expiry and logout UX", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    stubLocation("/admin/inquiry");
    mockRedirectToLogin.mockClear();
    mockConfirm.mockReset();
    mockReload.mockReset();
    mockConfirm.mockReturnValue(true);
    Object.defineProperty(window, "confirm", { configurable: true, value: mockConfirm });
  });

  it("redirects with reason=expired when a 401 arrives from an adminFetch on a non-login admin page", async () => {
    server.use(
      adminMeOk,
      http.get(`${API_BASE}/admin/inquiries`, () =>
        HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
      )
    );
    renderShell();

    await waitFor(() =>
      expect(mockRedirectToLogin).toHaveBeenCalledWith("expired")
    );
  });

  it("logs out: confirms, calls the logout API, clears the session state, and redirects", async () => {
    const onLogout = vi.fn();
    server.use(
      adminMeOk,
      http.post(`${API_BASE}/admin/auth/logout`, () => {
        onLogout();
        return HttpResponse.json({ ok: true });
      })
    );
    const user = userEvent.setup();
    renderShell();

    await user.click(await screen.findByRole("button", { name: /keluar/i }));

    expect(mockConfirm).toHaveBeenCalledWith(expect.stringContaining("keluar"));
    expect(onLogout).toHaveBeenCalled();
    await waitFor(() => expect(mockRedirectToLogin).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /keluar/i })).not.toBeInTheDocument()
    );
  });

  it("does not log out when the confirm dialog is cancelled", async () => {
    const onLogout = vi.fn();
    server.use(
      adminMeOk,
      http.post(`${API_BASE}/admin/auth/logout`, () => {
        onLogout();
        return HttpResponse.json({ ok: true });
      })
    );
    mockConfirm.mockReturnValue(false);
    const user = userEvent.setup();
    renderShell();

    await user.click(await screen.findByRole("button", { name: /keluar/i }));

    expect(onLogout).not.toHaveBeenCalled();
    expect(mockRedirectToLogin).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /keluar/i })).toBeInTheDocument();
  });

  it("still redirects to login when the logout API fails", async () => {
    server.use(
      adminMeOk,
      http.post(`${API_BASE}/admin/auth/logout`, () =>
        HttpResponse.json({ error: "Boom" }, { status: 500 })
      )
    );
    const user = userEvent.setup();
    renderShell();

    await user.click(await screen.findByRole("button", { name: /keluar/i }));

    await waitFor(() => expect(mockRedirectToLogin).toHaveBeenCalled());
  });
});

describe("CSRF 403 UX", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    stubLocation("/admin/inquiry");
    mockRedirectToLogin.mockClear();
    mockConfirm.mockReset();
    mockReload.mockReset();
    Object.defineProperty(window, "confirm", { configurable: true, value: mockConfirm });
  });

  it("shows the Forbidden banner with a reload button when adminFetch returns 403", async () => {
    server.use(
      adminMeOk,
      http.get(`${API_BASE}/admin/inquiries`, () =>
        HttpResponse.json({ error: "Forbidden" }, { status: 403 })
      )
    );
    const user = userEvent.setup();
    renderShell();

    expect(
      await screen.findByText("Forbidden — muat ulang halaman")
    ).toBeInTheDocument();
    expect(mockRedirectToLogin).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /muat ulang/i }));
    expect(mockReload).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /tutup/i }));
    expect(
      screen.queryByText("Forbidden — muat ulang halaman")
    ).not.toBeInTheDocument();
  });
});
