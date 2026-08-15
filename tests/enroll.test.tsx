import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QRCode from "qrcode";
import { http, HttpResponse } from "msw";
import {
  server,
  adminEnrollOk,
  adminEnrollConfirmCapture,
  adminEnrollConfirmUnauthorized,
  ENROLL_SECRET,
  ENROLL_OTPAUTH_URI,
  ENROLL_BACKUP_CODES,
} from "./msw-server";
import EnrollPage from "../src/app/admin/login/enroll/page";

const { mockPush, mockSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSearchParams: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/admin/login/enroll",
}));

vi.mock("@/lib/admin/useQueryParams", () => ({
  useQueryParams: () => mockSearchParams.current,
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

vi.mock("qrcode", () => ({
  default: { toDataURL: vi.fn(() => Promise.resolve("data:image/png;base64,FAKEQR")) },
}));

const EMAIL = "admin@tpq-qurani.example.id";

const QR_ALT = /pindai kode qr/i;
const FAKE_DATA_URL = "data:image/png;base64,FAKEQR";

async function scanThroughQr(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByAltText(QR_ALT);
  await user.click(screen.getByRole("button", { name: /saya sudah memindai/i }));
  await screen.findByRole("heading", { name: /kode cadangan anda/i });
}

async function reachTotpStep(user: ReturnType<typeof userEvent.setup>) {
  await scanThroughQr(user);
  await user.click(
    screen.getByRole("checkbox", {
      name: /saya sudah menyimpan kode cadangan di tempat aman/i,
    })
  );
  await user.click(screen.getByRole("button", { name: /lanjut/i }));
  await screen.findByRole("heading", { name: /verifikasi kode pertama/i });
}

describe("Admin 2FA enrollment wizard", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.current = new URLSearchParams({ email: EMAIL });
    vi.mocked(QRCode.toDataURL).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a data-URL QR image from the otpauth URI and shows all backup codes once", async () => {
    server.use(adminEnrollOk);
    const user = userEvent.setup();
    render(<EnrollPage />);

    const img = await screen.findByAltText(QR_ALT);
    expect(img).toHaveAttribute("src", FAKE_DATA_URL);
    expect(QRCode.toDataURL).toHaveBeenCalledWith(ENROLL_OTPAUTH_URI, {
      width: 220,
      margin: 1,
    });

    await user.click(screen.getByRole("button", { name: /saya sudah memindai/i }));
    await screen.findByRole("heading", { name: /kode cadangan anda/i });

    for (const code of ENROLL_BACKUP_CODES) {
      expect(screen.getByText(code)).toBeInTheDocument();
    }
    expect(screen.getByText(/hanya ditampilkan sekali/i)).toBeInTheDocument();
  });

  it("confirms enrollment echoing the exact secret, token and backup codes, then navigates to /admin", async () => {
    let captured: unknown;
    server.use(adminEnrollOk, adminEnrollConfirmCapture((body) => (captured = body)));
    const user = userEvent.setup();
    render(<EnrollPage />);

    await reachTotpStep(user);

    await user.type(screen.getByLabelText(/kode totp/i), "123456");
    await user.click(screen.getByRole("button", { name: /verifikasi & aktifkan/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin"));
    expect(captured).toEqual({
      email: EMAIL,
      secret: ENROLL_SECRET,
      token: "123456",
      backup_codes: ENROLL_BACKUP_CODES,
    });
  });

  it("shows the API message on enroll failure and retries on demand", async () => {
    let fail = true;
    server.use(
      http.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/auth/enroll`, () => {
        if (fail) {
          return HttpResponse.json({ error: "2FA already configured" }, { status: 409 });
        }
        return HttpResponse.json({
          secret: ENROLL_SECRET,
          otpauth_uri: ENROLL_OTPAUTH_URI,
          backup_codes: ENROLL_BACKUP_CODES,
        });
      })
    );
    const user = userEvent.setup();
    render(<EnrollPage />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("2FA already configured")
    );

    fail = false;
    await user.click(screen.getByRole("button", { name: /coba lagi/i }));
    await screen.findByAltText(QR_ALT);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the API's Invalid credentials message inline when the TOTP confirm fails", async () => {
    server.use(adminEnrollOk, adminEnrollConfirmUnauthorized);
    const user = userEvent.setup();
    render(<EnrollPage />);

    await reachTotpStep(user);

    await user.type(screen.getByLabelText(/kode totp/i), "000000");
    await user.click(screen.getByRole("button", { name: /verifikasi & aktifkan/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials")
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("downloads the backup codes as a .txt file containing every code", async () => {
    server.use(adminEnrollOk);
    const createObjectURL = vi.fn((_blob: Blob) => "blob:mock");
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeObjectURL as unknown as typeof URL.revokeObjectURL;
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const user = userEvent.setup();
    render(<EnrollPage />);

    await scanThroughQr(user);
    await user.click(screen.getByRole("button", { name: /unduh/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(await blob.text()).toBe(ENROLL_BACKUP_CODES.join("\n"));
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });

  it("shows a friendly QR error with retry when QR generation fails, not a raw error", async () => {
    server.use(adminEnrollOk);
    vi.mocked(QRCode.toDataURL).mockRejectedValueOnce(new Error("boom"));
    const user = userEvent.setup();
    render(<EnrollPage />);

    expect(
      await screen.findByText("Gagal membuat QR \u2014 coba lagi")
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toHaveTextContent(
      "Gagal membuat QR \u2014 coba lagi"
    );
    expect(screen.queryByText("boom")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(await screen.findByAltText(QR_ALT)).toBeInTheDocument();
  });

  it("copies all backup codes to the clipboard", async () => {
    server.use(adminEnrollOk);
    const user = userEvent.setup();
    render(<EnrollPage />);

    await scanThroughQr(user);
    await user.click(screen.getByRole("button", { name: /salin semua/i }));

    await waitFor(async () => {
      expect(await navigator.clipboard.readText()).toBe(
        ENROLL_BACKUP_CODES.join("\n")
      );
    });
  });

  it("does not claim success or leak an unhandled rejection when the clipboard write fails", async () => {
    server.use(adminEnrollOk);
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValueOnce(new Error("denied"));
    const unhandled: unknown[] = [];
    const onRejection = (reason: unknown) => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", onRejection);
    render(<EnrollPage />);

    await scanThroughQr(user);
    await user.click(screen.getByRole("button", { name: /salin semua/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    await new Promise((resolve) => setTimeout(resolve, 50));
    process.off("unhandledRejection", onRejection);
    expect(unhandled).toHaveLength(0);
    expect(screen.queryByText("Tersalin!")).not.toBeInTheDocument();
  });

  it("asks for the email when the email param is missing and enrolls with it", async () => {
    mockSearchParams.current = new URLSearchParams();
    server.use(adminEnrollOk);
    const user = userEvent.setup();
    render(<EnrollPage />);

    await user.type(screen.getByLabelText(/email/i), EMAIL);
    await user.click(screen.getByRole("button", { name: /mulai/i }));

    await screen.findByAltText(QR_ALT);
    expect(QRCode.toDataURL).toHaveBeenCalledWith(ENROLL_OTPAUTH_URI, {
      width: 220,
      margin: 1,
    });
  });
});
