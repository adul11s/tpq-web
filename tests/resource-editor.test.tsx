import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  server,
  categoriesHandler,
  contentCreateHandler,
} from "./msw-server";
import { EntityForm } from "../src/components/admin/EntityForm";
import { ENTITY_CONFIG } from "../src/lib/admin/entities";
import KontenNewPage from "../src/app/admin/konten/[entity]/baru/page";

const { mockPush, mockParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockParams: { current: { entity: "resources" } } as {
    current: Record<string, string>;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams.current,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/konten/resources",
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

const CATEGORIES = [
  { id: 1, name: "Doa Harian", slug: "prayers", description: null },
  { id: 7, name: "Al-Quran", slug: "al-quran", description: null },
];

describe("Resource editor", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockPush.mockClear();
    mockParams.current = { entity: "resources" };
  });

  it("auto-fills the slug from the title on blur, keeping manual edits", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EntityForm entity={ENTITY_CONFIG.resources} onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText("Judul");
    const slugInput = screen.getByLabelText("Slug");
    await user.type(titleInput, "Doa Sebelum Makan");
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue("doa-sebelum-makan");

    await user.clear(slugInput);
    await user.type(slugInput, "doa-saya-sendiri");
    await user.type(titleInput, "Doa Lain");
    fireEvent.blur(titleInput);

    expect(slugInput).toHaveValue("doa-saya-sendiri");
  });

  it("populates the category select from GET /categories", async () => {
    server.use(categoriesHandler(CATEGORIES));
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EntityForm entity={ENTITY_CONFIG.resources} onSubmit={onSubmit} />);

    const option = await screen.findByRole("option", { name: "Al-Quran" });
    expect(option).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Doa Harian" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Judul"), "Doa Sebelum Makan");
    fireEvent.blur(screen.getByLabelText("Judul"));
    await user.selectOptions(screen.getByLabelText("Kategori"), "7");
    await user.selectOptions(screen.getByLabelText("Kelompok usia"), "tpa");
    await user.type(screen.getByLabelText("File materi"), "10");
    await user.type(screen.getByLabelText("Thumbnail"), "11");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ category_id: 7, title: "Doa Sebelum Makan" })
      )
    );
  });

  it("shows all four age group options", () => {
    render(<EntityForm entity={ENTITY_CONFIG.resources} onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("option", { name: "PAUD 3\u20134" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "TK 5\u20136" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "TPA 7\u201312" })
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Semua" })).toBeInTheDocument();
  });

  it("shows an inline error when file_media_id is missing and does not POST", async () => {
    const onRequest = vi.fn();
    server.use(categoriesHandler(CATEGORIES), contentCreateHandler("resources", onRequest));
    const user = userEvent.setup();
    render(<KontenNewPage />);

    await user.type(screen.getByLabelText("Judul"), "Doa Sebelum Makan");
    fireEvent.blur(screen.getByLabelText("Judul"));
    await user.selectOptions(
      await screen.findByLabelText("Kategori"),
      "7"
    );
    await user.selectOptions(screen.getByLabelText("Kelompok usia"), "tpa");
    await user.type(screen.getByLabelText("Thumbnail"), "11");
    await user.click(screen.getByRole("button", { name: "Simpan Draft" }));

    await waitFor(() =>
      expect(screen.getByText("ID file wajib diisi")).toBeInTheDocument()
    );
    expect(onRequest).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
