import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { server } from "./msw-server";
import { adminMeUnauthorized } from "./msw-server";
import { SessionProvider, useSession, AuthGate } from "../src/lib/admin/session";
import React from "react";

const { mockRedirectToLogin, mockPathname } = vi.hoisted(() => ({
  mockRedirectToLogin: vi.fn(),
  mockPathname: { current: "/admin/login" },
}));

vi.mock("../src/lib/admin/redirect", () => ({
  redirectToLogin: mockRedirectToLogin,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname.current,
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

function StatusProbe() {
  const session = useSession();
  return (
    <div>
      <span data-testid="session-status">{session.status}</span>
      <span data-testid="session-role">{session.user?.role ?? "none"}</span>
    </div>
  );
}

describe("SessionProvider", () => {
  it("becomes authenticated with the admin user when /admin/me returns 200", async () => {
    render(
      <SessionProvider>
        <StatusProbe />
      </SessionProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("session-status")).toHaveTextContent(
        "authenticated"
      )
    );
    expect(screen.getByTestId("session-role")).toHaveTextContent("admin");
    expect(mockRedirectToLogin).not.toHaveBeenCalled();
  });

  it("becomes unauthenticated and redirects with reason=expired when /admin/me returns 401", async () => {
    server.use(adminMeUnauthorized);

    render(
      <SessionProvider>
        <StatusProbe />
      </SessionProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("session-status")).toHaveTextContent(
        "unauthenticated"
      )
    );
    expect(mockRedirectToLogin).toHaveBeenCalledWith("expired");
  });

  it("renders children on login routes even when unauthenticated", async () => {
    server.use(adminMeUnauthorized);

    render(
      <SessionProvider>
        <AuthGate>
          <div data-testid="login-form">login form</div>
        </AuthGate>
      </SessionProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("login-form")).toBeInTheDocument()
    );
    expect(mockRedirectToLogin).toHaveBeenCalledWith("expired");
  });

  it("renders the session-expired fallback on non-login routes when unauthenticated", async () => {
    mockPathname.current = "/admin/pengguna";
    server.use(adminMeUnauthorized);

    render(
      <SessionProvider>
        <AuthGate>
          <div data-testid="secret">protected</div>
        </AuthGate>
      </SessionProvider>
    );

    await waitFor(() =>
      expect(
        screen.getByText("Sesi berakhir. Silakan masuk kembali.")
      ).toBeInTheDocument()
    );
    expect(screen.queryByTestId("secret")).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Masuk ke Panel Admin/i });
    expect(link).toHaveAttribute("href", "/admin/login");
  });
});
