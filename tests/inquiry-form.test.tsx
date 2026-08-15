import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InquiryForm } from "@/components/landing/InquiryForm";
import { submitInquiry } from "@/lib/data/pages";
import { ApiError } from "@/lib/api/client";
import type { ClassSummary } from "@/lib/types/class";

vi.mock("@/lib/data/pages", () => ({
  submitInquiry: vi.fn(),
}));

const submitInquiryMock = vi.mocked(submitInquiry);

const CLASSES: ClassSummary[] = [
  {
    id: 1,
    code: "PAUD",
    slug: "paud",
    name: "PAUD Qur'ani",
    nameEn: null,
    ageMin: 3,
    ageMax: 4,
    description: null,
    descriptionEn: null,
    hours: null,
    capacity: null,
  },
  {
    id: 2,
    code: "TK",
    slug: "tk",
    name: "TK Qur'ani",
    nameEn: null,
    ageMin: 5,
    ageMax: 6,
    description: null,
    descriptionEn: null,
    hours: null,
    capacity: null,
  },
];

function renderForm(version = "1.0") {
  return render(
    <InquiryForm
      lang="id"
      classes={CLASSES}
      privacyPolicyVersion={version}
      privacyPolicyPath="/privacy-policy"
    />,
  );
}

async function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Nama Ayah/Bunda *"), {
    target: { value: "Ibu Siti Rahma" },
  });
  fireEvent.change(screen.getByLabelText("Nomor WhatsApp *"), {
    target: { value: "081234567890" },
  });
  fireEvent.change(screen.getByLabelText("Usia Ananda *"), {
    target: { value: "5 tahun" },
  });
  fireEvent.change(screen.getByLabelText("Program yang Diminati *"), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText("Pertanyaan *"), {
    target: {
      value: "Apakah ada program sore untuk anak usia 5 tahun?",
    },
  });
  fireEvent.click(screen.getByRole("checkbox"));
}

describe("InquiryForm (kontak page)", () => {
  it("focuses the first invalid field when submitting an empty form", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Kirim Pertanyaan" }));
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute(
        "id",
        "inquiry-parent-name",
      ),
    );
    expect(screen.getByText("Nama harus 2–150 karakter")).toBeInTheDocument();
  });

  it("links the consent text to the real privacy policy URL", () => {
    renderForm();
    const privacyLink = screen.getByRole("link", {
      name: "Kebijakan Privasi",
    });
    expect(privacyLink).toHaveAttribute("href", "/privacy-policy");
    expect(privacyLink.getAttribute("href")).not.toBe("#");
  });

  it("submits the API contract payload and shows the success panel with WhatsApp prefill", async () => {
    submitInquiryMock.mockResolvedValueOnce({ id: 42, message: "Terima kasih!" });
    renderForm();
    await fillValidForm();

    fireEvent.click(screen.getByRole("button", { name: "Kirim Pertanyaan" }));

    await waitFor(() =>
      expect(submitInquiryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          parent_name: "Ibu Siti Rahma",
          phone: "081234567890",
          child_age: "5 tahun",
          program_class_id: 2,
          message: "Apakah ada program sore untuk anak usia 5 tahun?",
          consent_given: true,
          privacy_policy_version: "1.0",
          website: undefined,
        }),
      ),
    );

    const waButton = await screen.findByRole("link", {
      name: "Lanjut via WhatsApp",
    });
    const href = waButton.getAttribute("href") ?? "";
    expect(href.startsWith("https://wa.me/6281234567890?text=")).toBe(true);
    const decoded = decodeURIComponent(href);
    expect(decoded).toContain("usia anak: 5 tahun");
    expect(decoded).toContain("program: TK Qur'ani");
    expect(decoded).toContain("Apakah ada program sore");

    fireEvent.click(screen.getByRole("button", { name: "Kirim pertanyaan lain" }));
    expect(screen.getByLabelText("Nama Ayah/Bunda *")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama Ayah/Bunda *")).toHaveValue("");
  });

  it("keeps the invisible honeypot in the submitted payload", async () => {
    submitInquiryMock.mockResolvedValueOnce({ id: 43, message: "Terima kasih!" });
    const { container } = renderForm();
    await fillValidForm();

    const website = container.querySelector(
      "#inquiry-website",
    ) as HTMLInputElement;
    expect(website).not.toBeNull();
    expect(website.tabIndex).toBe(-1);
    fireEvent.change(website, { target: { value: "spam-bot" } });
    fireEvent.click(screen.getByRole("button", { name: "Kirim Pertanyaan" }));

    await waitFor(() =>
      expect(submitInquiryMock).toHaveBeenCalledWith(
        expect.objectContaining({ website: "spam-bot" }),
      ),
    );
  });

  it("forces re-consent when the privacy policy version changes", () => {
    const { rerender } = renderForm("1.0");
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    rerender(
      <InquiryForm
        lang="id"
        classes={CLASSES}
        privacyPolicyVersion="2.0"
        privacyPolicyPath="/privacy-policy"
      />,
    );

    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(
      screen.getByText(/Kebijakan Privasi telah diperbarui/),
    ).toBeInTheDocument();
  });

  it("surfaces 422 field errors and the 429 rate-limit message", async () => {
    submitInquiryMock.mockRejectedValueOnce(
      new ApiError(422, "Validasi gagal", { phone: "Nomor HP tidak valid" }),
    );
    renderForm();
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Kirim Pertanyaan" }));

    expect(await screen.findByText("Nomor HP tidak valid")).toBeInTheDocument();

    submitInquiryMock.mockRejectedValueOnce(
      new ApiError(429, "Terlalu banyak pengajuan, coba lagi nanti"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Kirim Pertanyaan" }));
    expect(
      await screen.findByText("Terlalu banyak pengajuan, coba lagi nanti"),
    ).toBeInTheDocument();
  });
});
