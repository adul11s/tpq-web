import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePassword } from "@/components/parent/ChangePassword";
import {
  ParentSessionProvider,
  useParentSession,
} from "@/lib/parent/session";
import { parentApi } from "@/lib/api/parent";
import { ApiError } from "@/lib/api/client";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const ME_MUST_CHANGE = new ApiError(
  403,
  "Password harus diganti terlebih dahulu",
);

function MustChangeProbe() {
  const session = useParentSession();
  return <span data-testid="must-change">{String(session.mustChangePassword)}</span>;
}

function renderChangePassword(lang: "id" | "en" = "id") {
  return render(
    <ParentSessionProvider>
      <ChangePassword lang={lang} />
      <MustChangeProbe />
    </ParentSessionProvider>
  );
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  lang: "id" | "en",
  current: string,
  next: string,
  confirm: string,
) {
  const labels = {
    id: {
      current: "Kata Sandi Saat Ini",
      next: "Kata Sandi Baru",
      confirm: "Ulangi Kata Sandi Baru",
      submit: "Simpan",
    },
    en: {
      current: "Current Password",
      next: "New Password",
      confirm: "Confirm New Password",
      submit: "Save",
    },
  };
  const t = labels[lang];
  await user.type(await screen.findByLabelText(t.current), current);
  await user.type(await screen.findByLabelText(t.next), next);
  await user.type(await screen.findByLabelText(t.confirm), confirm);
  await user.click(screen.getByRole("button", { name: t.submit }));
}

describe("ChangePassword", () => {
  let changeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockPush.mockClear();
    vi.spyOn(parentApi, "me").mockRejectedValue(ME_MUST_CHANGE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts { current_password, new_password } on submit", async () => {
    changeSpy = vi
      .spyOn(parentApi, "changePassword")
      .mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderChangePassword("id");

    expect(
      await screen.findByRole("heading", { name: "Ganti Kata Sandi" })
    ).toBeInTheDocument();

    await fillAndSubmit(user, "id", "secret1", "rahasia123", "rahasia123");

    await waitFor(() =>
      expect(changeSpy).toHaveBeenCalledWith({
        current_password: "secret1",
        new_password: "rahasia123",
      })
    );
  });

  it("unlocks the forced-change flag, shows the success notice, and navigates to /parent/anak", async () => {
    changeSpy = vi
      .spyOn(parentApi, "changePassword")
      .mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderChangePassword("id");

    await waitFor(() =>
      expect(screen.getByTestId("must-change")).toHaveTextContent("true")
    );

    await fillAndSubmit(user, "id", "secret1", "rahasia123", "rahasia123");

    await waitFor(() =>
      expect(screen.getByTestId("must-change")).toHaveTextContent("false")
    );
    await waitFor(() =>
      expect(screen.getByText("Kata sandi berhasil diubah")).toBeInTheDocument()
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/parent/anak"));
  });

  it("navigates to the lang-prefixed anak route on success", async () => {
    changeSpy = vi
      .spyOn(parentApi, "changePassword")
      .mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderChangePassword("en");

    await fillAndSubmit(user, "en", "secret1", "rahasia123", "rahasia123");

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/en/parent/anak")
    );
  });

  it("shows the backend 401 copy verbatim and does not navigate", async () => {
    changeSpy = vi
      .spyOn(parentApi, "changePassword")
      .mockRejectedValue(new ApiError(401, "Password saat ini salah"));
    const user = userEvent.setup();
    renderChangePassword("id");

    await fillAndSubmit(user, "id", "wrong", "rahasia123", "rahasia123");

    await waitFor(() =>
      expect(screen.getByText("Password saat ini salah")).toBeInTheDocument()
    );
    expect(screen.getByTestId("must-change")).toHaveTextContent("true");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows 'Password baru harus berbeda' verbatim on a same-as-current 422", async () => {
    changeSpy = vi
      .spyOn(parentApi, "changePassword")
      .mockRejectedValue(new ApiError(422, "Password baru harus berbeda"));
    const user = userEvent.setup();
    renderChangePassword("id");

    await fillAndSubmit(user, "id", "secret01", "secret01", "secret01");

    await waitFor(() =>
      expect(screen.getByText("Password baru harus berbeda")).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows the backend message on other 422 errors", async () => {
    changeSpy = vi
      .spyOn(parentApi, "changePassword")
      .mockRejectedValue(
        new ApiError(422, "String must contain at most 128 character(s)")
      );
    const user = userEvent.setup();
    renderChangePassword("id");

    await fillAndSubmit(user, "id", "secret1", "rahasia123", "rahasia123");

    await waitFor(() =>
      expect(
        screen.getByText("String must contain at most 128 character(s)")
      ).toBeInTheDocument()
    );
  });

  it("shows a generic message on other API errors", async () => {
    changeSpy = vi
      .spyOn(parentApi, "changePassword")
      .mockRejectedValue(new ApiError(500, "Internal server error"));
    const user = userEvent.setup();
    renderChangePassword("id");

    await fillAndSubmit(user, "id", "secret1", "rahasia123", "rahasia123");

    await waitFor(() =>
      expect(screen.getByText("Terjadi kesalahan. Coba lagi nanti.")).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("rejects a new password shorter than 8 characters inline without posting", async () => {
    changeSpy = vi
      .spyOn(parentApi, "changePassword")
      .mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderChangePassword("id");

    await fillAndSubmit(user, "id", "secret1", "short", "short");

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Kata sandi baru minimal 8 karakter"
      )
    );
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it("rejects a mismatched confirmation inline without posting", async () => {
    changeSpy = vi
      .spyOn(parentApi, "changePassword")
      .mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderChangePassword("id");

    await fillAndSubmit(user, "id", "secret1", "rahasia123", "rahasia456");

    await waitFor(() =>
      expect(screen.getByText("Ulangi kata sandi tidak cocok")).toBeInTheDocument()
    );
    expect(changeSpy).not.toHaveBeenCalled();
  });
});