import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import {
  server,
  API_BASE,
  adminLoginChallenge,
  adminLoginUnauthorized,
  adminLoginRateLimited,
  adminLoginDelayed,
} from "./msw-server";
import LoginPage from "../src/app/admin/login/page";

const { mockPush, mockSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSearchParams: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/admin/login",
  useSearchParams: () => mockSearchParams.current,
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/email/i), "admin@tpq-qurani.example.id");
  await user.type(screen.getByLabelText(/kata sandi/i), "secret123");
  await user.click(screen.getByRole("button", { name: /masuk/i }));
}

describe("Admin login page", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.current = new URLSearchParams();
  });

  it("navigates to the TOTP verify step with the email when the challenge is totp", async () => {
    server.use(adminLoginChallenge("totp"));
    const user = userEvent.setup();
    render(<LoginPage />);

    await fillAndSubmit(user);

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        "/admin/login/verify?email=admin%40tpq-qurani.example.id"
      )
    );
  });

  it("navigates to the enroll step with the email when the challenge is enroll", async () => {
    server.use(adminLoginChallenge("enroll"));
    const user = userEvent.setup();
    render(<LoginPage />);

    await fillAndSubmit(user);

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        "/admin/login/enroll?email=admin%40tpq-qurani.example.id"
      )
    );
  });

  it("shows the exact API message once on 401", async () => {
    server.use(adminLoginUnauthorized);
    const user = userEvent.setup();
    render(<LoginPage />);

    await fillAndSubmit(user);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials")
    );
    expect(screen.getAllByText("Invalid credentials")).toHaveLength(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows the API's rate-limit message on 429", async () => {
    server.use(adminLoginRateLimited);
    const user = userEvent.setup();
    render(<LoginPage />);

    await fillAndSubmit(user);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Terlalu banyak percobaan login, coba lagi nanti"
      )
    );
  });

  it("shows the identical message for an unknown user and a wrong password", async () => {
    server.use(adminLoginUnauthorized);
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "nobody@example.id");
    await user.type(screen.getByLabelText(/kata sandi/i), "whatever123");
    await user.click(screen.getByRole("button", { name: /masuk/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials")
    );

    await user.clear(screen.getByLabelText(/email/i));
    await user.clear(screen.getByLabelText(/kata sandi/i));
    await user.type(screen.getByLabelText(/email/i), "admin@tpq-qurani.example.id");
    await user.type(screen.getByLabelText(/kata sandi/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /masuk/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials")
    );
    expect(screen.getAllByText("Invalid credentials")).toHaveLength(1);
  });

  it("disables the submit button while the request is in flight", async () => {
    server.use(adminLoginDelayed);
    const user = userEvent.setup();
    render(<LoginPage />);

    await fillAndSubmit(user);

    expect(screen.getByRole("button", { name: /masuk/i })).toBeDisabled();
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        "/admin/login/verify?email=admin%40tpq-qurani.example.id"
      )
    );
  });

  it("shows the expired-session banner when arriving with reason=expired", () => {
    mockSearchParams.current = new URLSearchParams("reason=expired");
    render(<LoginPage />);

    expect(
      screen.getByText("Sesi berakhir, silakan masuk kembali")
    ).toBeInTheDocument();
  });
});

it("handles a direct-session login ({ ok: true }) by navigating straight to /admin", async () => {
  server.use(
    http.post(`${API_BASE}/admin/auth/login`, () =>
      HttpResponse.json({ ok: true }, { status: 200 })
    )
  );
  render(<LoginPage />);
  const devUser = userEvent.setup();
  await devUser.type(screen.getByLabelText(/email/i), "admin@tpq.id");
  await devUser.type(screen.getByLabelText(/kata sandi/i), "admin123");
  await devUser.click(screen.getByRole("button", { name: /masuk/i }));
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin"));
});

it("handles challenge: null (REQUIRE_2FA=0) by navigating straight to /admin", async () => {
  server.use(
    http.post(`${API_BASE}/admin/auth/login`, () =>
      HttpResponse.json({ challenge: null }, { status: 200 })
    )
  );
  render(<LoginPage />);
  const devUser = userEvent.setup();
  await devUser.type(screen.getByLabelText(/email/i), "admin@tpq.id");
  await devUser.type(screen.getByLabelText(/kata sandi/i), "admin123");
  await devUser.click(screen.getByRole("button", { name: /masuk/i }));
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin"));
});
