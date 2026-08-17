import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParentNav } from "@/components/parent/ParentNav";
import {
  ParentSessionProvider,
  useParentSession,
} from "@/lib/parent/session";
import { parentApi, type ParentMe } from "@/lib/api/parent";
import { ApiError } from "@/lib/api/client";

const { mockPush, mockReplace } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const ME_OK: ParentMe = {
  ok: true,
  email: "ibu@example.com",
  full_name: "Ibu Siti Rahma",
  must_change_password: false,
};

function StatusProbe() {
  const session = useParentSession();
  return <span data-testid="status">{session.status}</span>;
}

function renderNav(lang: "id" | "en" = "id") {
  return render(
    <ParentSessionProvider>
      <StatusProbe />
      <ParentNav lang={lang} />
    </ParentSessionProvider>
  );
}

describe("ParentNav", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an Anak Saya link and a Keluar button when authed", async () => {
    vi.spyOn(parentApi, "me").mockResolvedValue(ME_OK);
    renderNav("id");

    const link = await screen.findByRole("link", { name: "Anak Saya" });
    expect(link).toHaveAttribute("href", "/parent/anak");
    expect(
      screen.getByRole("button", { name: "Keluar" }),
    ).toBeInTheDocument();
  });

  it("lang-prefixes the Anak Saya link for the en locale", async () => {
    vi.spyOn(parentApi, "me").mockResolvedValue(ME_OK);
    renderNav("en");

    const link = await screen.findByRole("link", { name: "My Children" });
    expect(link).toHaveAttribute("href", "/en/parent/anak");
    expect(
      screen.getByRole("button", { name: "Log Out" }),
    ).toBeInTheDocument();
  });

  it("calls parentApi.logout, clears the session, and redirects to the lang-prefixed login page", async () => {
    const logoutSpy = vi
      .spyOn(parentApi, "logout")
      .mockResolvedValue({ ok: true });
    vi.spyOn(parentApi, "me").mockResolvedValue(ME_OK);
    const user = userEvent.setup();
    renderNav("en");

    await user.click(
      await screen.findByRole("button", { name: "Log Out" }),
    );

    await waitFor(() => expect(logoutSpy).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/en/parent/login"),
    );
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest"),
    );
    expect(
      screen.queryByRole("button", { name: "Log Out" }),
    ).not.toBeInTheDocument();
  });

  it("redirects to /parent/login without a lang prefix for id", async () => {
    vi.spyOn(parentApi, "logout").mockResolvedValue({ ok: true });
    vi.spyOn(parentApi, "me").mockResolvedValue(ME_OK);
    const user = userEvent.setup();
    renderNav("id");

    await user.click(
      await screen.findByRole("button", { name: "Keluar" }),
    );

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/parent/login"),
    );
  });

  it("shows an error and stays authed when logout fails", async () => {
    vi.spyOn(parentApi, "logout").mockRejectedValue(
      new ApiError(500, "Internal server error"),
    );
    vi.spyOn(parentApi, "me").mockResolvedValue(ME_OK);
    const user = userEvent.setup();
    renderNav("id");

    await user.click(
      await screen.findByRole("button", { name: "Keluar" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Gagal keluar. Coba lagi nanti.",
      ),
    );
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId("status")).toHaveTextContent("authed");
    expect(
      screen.getByRole("button", { name: "Keluar" }),
    ).toBeInTheDocument();
  });

  it("renders nothing while the session is loading", () => {
    let resolveMe: (value: typeof ME_OK) => void = () => {};
    vi.spyOn(parentApi, "me").mockReturnValue(
      new Promise((resolve) => {
        resolveMe = resolve;
      }),
    );
    renderNav("id");

    expect(screen.queryByRole("link", { name: "Anak Saya" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Keluar" }),
    ).not.toBeInTheDocument();

    resolveMe(ME_OK);
    void waitFor(() =>
      expect(screen.getByRole("link", { name: "Anak Saya" })).toBeInTheDocument(),
    );
  });

  it("renders nothing for a guest session", async () => {
    vi.spyOn(parentApi, "me").mockRejectedValue(
      new ApiError(401, "Unauthorized"),
    );
    renderNav("id");

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest"),
    );
    expect(screen.queryByRole("link", { name: "Anak Saya" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Keluar" }),
    ).not.toBeInTheDocument();
  });

  it("renders nothing while a password change is pending", async () => {
    vi.spyOn(parentApi, "me").mockRejectedValue(
      new ApiError(403, "Password harus diganti terlebih dahulu"),
    );
    renderNav("id");

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authed"),
    );
    expect(screen.queryByRole("link", { name: "Anak Saya" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Keluar" }),
    ).not.toBeInTheDocument();
  });
});
