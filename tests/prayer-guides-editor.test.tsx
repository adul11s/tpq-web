import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { server, contentCreateHandler, mediaListHandler } from "./msw-server";
import { EntityForm } from "../src/components/admin/EntityForm";
import { ENTITY_CONFIG } from "../src/lib/admin/entities";
import { SessionProvider } from "../src/lib/admin/session";
import KontenNewPage from "../src/app/admin/konten/[entity]/baru/page";

const { mockPush, mockParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockParams: { current: { entity: "prayer_guides" } } as {
    current: Record<string, string>;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams.current,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/konten/prayer_guides",
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

const EN_FALLBACK_HELPER = "Kosong = publikasi pakai bahasa Indonesia";

describe("Prayer guide editor", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockPush.mockClear();
    mockParams.current = { entity: "prayer_guides" };
  });

  it("auto-fills occasion_slug from occasion and posts the required fields", async () => {
    const onRequest = vi.fn();
    server.use(contentCreateHandler("prayer_guides", onRequest));
    const user = userEvent.setup();
    render(
      <SessionProvider>
        <KontenNewPage />
      </SessionProvider>
    );

    const occasion = await screen.findByLabelText("Kesempatan");
    await user.type(occasion, "Doa Sebelum Makan");
    fireEvent.blur(occasion);

    const slugInput = screen.getByLabelText("Slug Kesempatan");
    expect(slugInput).toHaveValue("doa-sebelum-makan");

    const arabic = screen.getByLabelText("Teks Arab");
    expect(arabic).toHaveAttribute("dir", "rtl");
    expect(arabic).toHaveClass("font-arabic");

    await user.type(
      arabic,
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650"
    );
    await user.type(
      screen.getByLabelText("Transliterasi"),
      "Bismillahirrahmanirrahim"
    );
    await user.type(
      screen.getByLabelText("Arti (ID)"),
      "Dengan nama Allah"
    );
    await user.click(screen.getByRole("button", { name: "Simpan Draft" }));

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    expect(onRequest.mock.calls[0][1]).toMatchObject({
      occasion: "Doa Sebelum Makan",
      occasion_slug: "doa-sebelum-makan",
      arabic_text: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
      transliteration: "Bismillahirrahmanirrahim",
      meaning_id: "Dengan nama Allah",
    });
    expect(onRequest.mock.calls[0][1]).not.toHaveProperty("meaning_en");
    expect(mockPush).toHaveBeenCalledWith("/admin/konten/prayer_guides");
  });

  it("shows the EN fallback helper while meaning_en is empty (G-03)", async () => {
    const user = userEvent.setup();
    render(<EntityForm entity={ENTITY_CONFIG.prayer_guides} onSubmit={vi.fn()} />);

    expect(screen.getByText(EN_FALLBACK_HELPER)).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("Arti (EN)"),
      "In the name of Allah"
    );
    expect(screen.queryByText(EN_FALLBACK_HELPER)).not.toBeInTheDocument();
  });

  it("picks an image asset for the teacher photo via MediaPicker", async () => {
    server.use(mediaListHandler());
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EntityForm entity={ENTITY_CONFIG.teachers} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nama"), "Ustadz Ahmad");
    await user.click(screen.getByLabelText("Foto"));
    await screen.findByText("foto-kegiatan.jpg");
    expect(
      screen.queryByText("laporan-bulanan.pdf")
    ).not.toBeInTheDocument();
    await user.click(screen.getByText("foto-kegiatan.jpg"));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Ustadz Ahmad",
          photo_media_id: 2,
        })
      )
    );
  });
});
