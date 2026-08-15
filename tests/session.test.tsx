import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { server } from "./msw-server";
import { adminMeUnauthorized } from "./msw-server";
import { SessionProvider, useSession } from "../src/lib/admin/session";

const { mockRedirectToLogin } = vi.hoisted(() => ({
  mockRedirectToLogin: vi.fn(),
}));

vi.mock("../src/lib/admin/redirect", () => ({
  redirectToLogin: mockRedirectToLogin,
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
});
