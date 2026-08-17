import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parentApi, type ParentMe } from "@/lib/api/parent";
import { ApiError } from "@/lib/api/client";
import {
  ParentSessionProvider,
  useParentSession,
} from "@/lib/parent/session";
import { ParentGate } from "@/components/parent/ParentGate";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const ME_OK: ParentMe = {
  ok: true,
  email: "ibu@example.com",
  full_name: "Ibu Siti Rahma",
  must_change_password: false,
};

function StatusProbe() {
  const session = useParentSession();
  return (
    <div>
      <span data-testid="status">{session.status}</span>
      <span data-testid="user">
        {session.user ? `${session.user.email}` : "none"}
      </span>
      <span data-testid="must-change">{String(session.mustChangePassword)}</span>
    </div>
  );
}

function RefreshProbe() {
  const session = useParentSession();
  return (
    <div>
      <span data-testid="status">{session.status}</span>
      <button onClick={() => session.refresh()}>refresh</button>
    </div>
  );
}

function SetSessionProbe() {
  const session = useParentSession();
  return (
    <div>
      <span data-testid="status">{session.status}</span>
      <button
        onClick={() =>
          session.setSession({
            email: "ibu@example.com",
            full_name: "Ibu Siti Rahma",
            must_change_password: false,
          })
        }
      >
        login
      </button>
    </div>
  );
}

describe("ParentSessionProvider + ParentGate", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("becomes guest on me() 401 and ParentGate redirects to /parent/login", async () => {
    const meSpy = vi
      .spyOn(parentApi, "me")
      .mockRejectedValue(new ApiError(401, "Unauthorized"));

    render(
      <ParentSessionProvider>
        <StatusProbe />
        <ParentGate lang="id">
          <div data-testid="protected">secret</div>
        </ParentGate>
      </ParentSessionProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest")
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/parent/login"));
    expect(meSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });

  it("is authed with mustChangePassword on me() 403 and ParentGate redirects to ganti-password", async () => {
    vi.spyOn(parentApi, "me").mockRejectedValue(
      new ApiError(403, "Password harus diganti terlebih dahulu")
    );

    render(
      <ParentSessionProvider>
        <StatusProbe />
        <ParentGate lang="en">
          <div data-testid="protected">secret</div>
        </ParentGate>
      </ParentSessionProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authed")
    );
    expect(screen.getByTestId("must-change")).toHaveTextContent("true");
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/en/parent/ganti-password")
    );
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });

  it("renders children when me() succeeds with must_change_password false", async () => {
    vi.spyOn(parentApi, "me").mockResolvedValue(ME_OK);

    render(
      <ParentSessionProvider>
        <ParentGate lang="id">
          <div data-testid="protected">secret</div>
        </ParentGate>
      </ParentSessionProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("protected")).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("render shows a loading spinner while me() is pending", async () => {
    let resolveMe: (value: typeof ME_OK) => void = () => {};
    vi.spyOn(parentApi, "me").mockReturnValue(
      new Promise((resolve) => {
        resolveMe = resolve;
      })
    );

    render(
      <ParentSessionProvider>
        <ParentGate lang="id">
          <div data-testid="protected">secret</div>
        </ParentGate>
      </ParentSessionProvider>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();

    resolveMe(ME_OK);
    await waitFor(() =>
      expect(screen.getByTestId("protected")).toBeInTheDocument()
    );
  });

  it("refresh() re-probes and flips an authed session to guest", async () => {
    const meSpy = vi
      .spyOn(parentApi, "me")
      .mockResolvedValueOnce(ME_OK)
      .mockRejectedValueOnce(new ApiError(401, "Unauthorized"));

    const user = userEvent.setup();
    render(
      <ParentSessionProvider>
        <RefreshProbe />
        <ParentGate lang="id">
          <div data-testid="protected">secret</div>
        </ParentGate>
      </ParentSessionProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authed")
    );
    expect(screen.getByTestId("protected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /refresh/i }));

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest")
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/parent/login"));
    expect(meSpy).toHaveBeenCalledTimes(2);
  });

  it("treats a network failure (non-ApiError) as guest", async () => {
    vi.spyOn(parentApi, "me").mockRejectedValue(
      new TypeError("Failed to fetch")
    );

    render(
      <ParentSessionProvider>
        <StatusProbe />
        <ParentGate lang="id">
          <div data-testid="protected">secret</div>
        </ParentGate>
      </ParentSessionProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("guest")
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/parent/login"));
  });

  it("latest-wins: a stale in-flight me() cannot clobber a newer setSession", async () => {
    let rejectMe: (reason: unknown) => void = () => {};
    vi.spyOn(parentApi, "me").mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectMe = reject;
      })
    );

    const user = userEvent.setup();
    render(
      <ParentSessionProvider>
        <SetSessionProbe />
      </ParentSessionProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");

    await user.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByTestId("status")).toHaveTextContent("authed");

    rejectMe(new ApiError(401, "Unauthorized"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByTestId("status")).toHaveTextContent("authed");
    expect(screen.getByTestId("status")).not.toHaveTextContent("guest");
  });
});