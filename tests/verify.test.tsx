import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  server,
  adminVerifyOk,
  adminVerifyUnauthorized,
  adminVerifyRateLimited,
} from "./msw-server";
import VerifyPage from "../src/app/admin/login/verify/page";

const { mockPush, mockSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSearchParams: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams.current,
  usePathname: () => "/admin/login/verify",
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

const EMAIL = "admin@tpq-qurani.example.id";

describe("Admin 2FA verify page", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.current = new URLSearchParams({ email: EMAIL });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits a valid TOTP code and navigates to /admin", async () => {
    server.use(adminVerifyOk);
    const user = userEvent.setup();
    render(<VerifyPage />);

    const totpInput = screen.getByLabelText(/kode totp/i);
    expect(totpInput).toHaveFocus();
    await user.type(totpInput, "123456");
    await user.click(screen.getByRole("button", { name: /verifikasi/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin"));
  });

  it("shows the API's Invalid credentials message inline on 401", async () => {
    server.use(adminVerifyUnauthorized);
    const user = userEvent.setup();
    render(<VerifyPage />);

    await user.type(screen.getByLabelText(/kode totp/i), "000000");
    await user.click(screen.getByRole("button", { name: /verifikasi/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials")
    );
    expect(screen.getAllByText("Invalid credentials")).toHaveLength(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows the API's rate-limit message on 429", async () => {
    server.use(adminVerifyRateLimited);
    const user = userEvent.setup();
    render(<VerifyPage />);

    await user.type(screen.getByLabelText(/kode totp/i), "123456");
    await user.click(screen.getByRole("button", { name: /verifikasi/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Terlalu banyak percobaan verifikasi, coba lagi nanti"
      )
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("accepts a backup code ABCD-EF12 and navigates to /admin", async () => {
    server.use(adminVerifyOk);
    const user = userEvent.setup();
    render(<VerifyPage />);

    await user.click(
      screen.getByRole("button", { name: /pakai kode cadangan/i })
    );

    const backupInput = screen.getByLabelText(/kode cadangan/i);
    await user.type(backupInput, "abcdef12");
    expect(backupInput).toHaveValue("ABCD-EF12");

    await user.click(screen.getByRole("button", { name: /verifikasi/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin"));
  });

  it("blocks a malformed backup code before any network call", async () => {
    server.use(adminVerifyOk);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<VerifyPage />);

    await user.click(
      screen.getByRole("button", { name: /pakai kode cadangan/i })
    );
    await user.type(screen.getByLabelText(/kode cadangan/i), "12AB");
    await user.click(screen.getByRole("button", { name: /verifikasi/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /format kode cadangan/i
      )
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows the email input when the email param is present but empty", () => {
    mockSearchParams.current = new URLSearchParams("email=");
    render(<VerifyPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders an email input and verifies with it when the email param is missing", async () => {
    mockSearchParams.current = new URLSearchParams();
    server.use(adminVerifyOk);
    const user = userEvent.setup();
    render(<VerifyPage />);

    await user.type(screen.getByLabelText(/email/i), EMAIL);
    await user.type(screen.getByLabelText(/kode totp/i), "123456");
    await user.click(screen.getByRole("button", { name: /verifikasi/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin"));
  });
});
