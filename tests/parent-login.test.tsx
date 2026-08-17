import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParentLogin } from "@/components/parent/ParentLogin";
import { ParentSessionProvider } from "@/lib/parent/session";
import { parentApi, type ParentLoginResult, type ParentMe } from "@/lib/api/parent";
import { ApiError } from "@/lib/api/client";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const LOGIN_OK: ParentLoginResult = { ok: true, must_change_password: false };
const LOGIN_MUST_CHANGE: ParentLoginResult = { ok: true, must_change_password: true };

const ME_GUEST = new ApiError(401, "Unauthorized");
const ME_OK: ParentMe = {
  ok: true,
  email: "ibu@example.com",
  full_name: "Ibu Siti Rahma",
  must_change_password: false,
};
const ME_MUST_CHANGE: ParentMe = {
  ok: true,
  email: "ibu@example.com",
  full_name: "Ibu Siti Rahma",
  must_change_password: true,
};

function renderLogin(lang: "id" | "en" = "id") {
  return render(
    <ParentSessionProvider>
      <ParentLogin lang={lang} />
    </ParentSessionProvider>
  );
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  lang: "id" | "en",
  email: string,
  password: string,
) {
  await user.type(await screen.findByLabelText("Email"), email);
  await user.type(
    await screen.findByLabelText(lang === "en" ? "Password" : "Kata sandi"),
    password,
  );
  await user.click(
    screen.getByRole("button", { name: lang === "en" ? "Log In" : "Masuk" }),
  );
}

describe("ParentLogin", () => {
  let meSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockPush.mockClear();
    meSpy = vi
      .spyOn(parentApi, "me")
      .mockRejectedValue(ME_GUEST);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits { email, password } and redirects to /parent/anak on success", async () => {
    const loginSpy = vi.spyOn(parentApi, "login").mockResolvedValue(LOGIN_OK);
    const user = userEvent.setup();
    renderLogin("id");

    expect(
      await screen.findByRole("heading", { name: "Masuk Orang Tua" })
    ).toBeInTheDocument();

    await fillAndSubmit(user, "id", "ibu@example.com", "secret123");

    await waitFor(() => expect(loginSpy).toHaveBeenCalledWith({
      email: "ibu@example.com",
      password: "secret123",
    }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/parent/anak"));
  });

  it("redirects to /parent/ganti-password with the lang prefix when must_change_password is true", async () => {
    vi.spyOn(parentApi, "login").mockResolvedValue(LOGIN_MUST_CHANGE);
    const user = userEvent.setup();
    renderLogin("en");

    await fillAndSubmit(user, "en", "ibu@example.com", "secret123");

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/en/parent/ganti-password")
    );
  });

  it("shows the backend 401 copy verbatim and does not navigate", async () => {
    vi.spyOn(parentApi, "login").mockRejectedValue(
      new ApiError(401, "Invalid credentials")
    );
    const user = userEvent.setup();
    renderLogin("id");

    await fillAndSubmit(user, "id", "ibu@example.com", "wrongpass");

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials")
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows the lockout copy on a 429", async () => {
    vi.spyOn(parentApi, "login").mockRejectedValue(
      new ApiError(429, "Terlalu banyak percobaan login, coba lagi nanti")
    );
    const user = userEvent.setup();
    renderLogin("id");

    await fillAndSubmit(user, "id", "ibu@example.com", "secret123");

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Terlalu banyak percobaan — coba lagi nanti"
      )
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows a generic message on other API errors", async () => {
    vi.spyOn(parentApi, "login").mockRejectedValue(
      new ApiError(500, "Internal server error")
    );
    const user = userEvent.setup();
    renderLogin("id");

    await fillAndSubmit(user, "id", "ibu@example.com", "secret123");

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Terjadi kesalahan. Coba lagi nanti."
      )
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects an already-authenticated parent away from the login form", async () => {
    meSpy.mockResolvedValue(ME_OK);
    renderLogin("id");

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/parent/anak"));
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Kata sandi")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Masuk Orang Tua" })
    ).not.toBeInTheDocument();
  });

  it("redirects an authenticated parent with a pending password change", async () => {
    meSpy.mockResolvedValue(ME_MUST_CHANGE);
    renderLogin("id");

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/parent/ganti-password")
    );
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });
});