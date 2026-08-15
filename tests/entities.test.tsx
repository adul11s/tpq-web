import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusBadge } from "../src/components/admin/StatusBadge";
import { EntityTable } from "../src/components/admin/EntityTable";
import { EntityForm } from "../src/components/admin/EntityForm";
import {
  ENTITY_CONFIG,
  AGE_GROUP_OPTIONS,
  CATEGORY_OPTIONS,
} from "../src/lib/admin/entities";

describe("StatusBadge", () => {
  it("renders Draft/Publik/Arsip labels per status", () => {
    const { rerender } = render(<StatusBadge status="draft" />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
    rerender(<StatusBadge status="published" />);
    expect(screen.getByText("Publik")).toBeInTheDocument();
    rerender(<StatusBadge status="archived" />);
    expect(screen.getByText("Arsip")).toBeInTheDocument();
  });
});

describe("EntityTable", () => {
  const draftRow = {
    id: 1,
    code: "TK",
    name: "TK Qur'ani Bintang",
    age_min: 5,
    age_max: 6,
    hours: "08.00-10.00 WIB",
    status: "draft",
  };
  const publishedRow = { ...draftRow, id: 2, status: "published" };

  it("hides Publish/Archive buttons for content_manager (D-CM-12)", () => {
    render(
      <EntityTable
        entity={ENTITY_CONFIG.classes}
        rows={[draftRow, publishedRow]}
        role="content_manager"
        onEdit={vi.fn()}
      />
    );
    expect(
      screen.queryByRole("button", { name: "Terbitkan" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Arsipkan" })
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(2);
  });

  it("shows Publish only for drafts and Archive only for published rows when role is admin", () => {
    render(
      <EntityTable
        entity={ENTITY_CONFIG.classes}
        rows={[draftRow, publishedRow]}
        role="admin"
        onEdit={vi.fn()}
        onPublish={vi.fn()}
        onArchive={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Terbitkan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Arsipkan" })).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Publik")).toBeInTheDocument();
  });

  it("invokes onEdit/onPublish/onArchive with the row", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onPublish = vi.fn();
    const onArchive = vi.fn();
    render(
      <EntityTable
        entity={ENTITY_CONFIG.classes}
        rows={[draftRow, publishedRow]}
        role="admin"
        onEdit={onEdit}
        onPublish={onPublish}
        onArchive={onArchive}
      />
    );
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    expect(onEdit).toHaveBeenCalledWith(draftRow);
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));
    expect(onPublish).toHaveBeenCalledWith(draftRow);
    await user.click(screen.getByRole("button", { name: "Arsipkan" }));
    expect(onArchive).toHaveBeenCalledWith(publishedRow);
  });
});

describe("EntityForm", () => {
  it("renders fields from the config and submits a snake_case payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EntityForm entity={ENTITY_CONFIG.classes} onSubmit={onSubmit} />);

    expect(screen.getByLabelText("Kode")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
    expect(screen.getByLabelText("Usia minimal")).toBeInTheDocument();
    expect(screen.getByLabelText("Usia maksimal")).toBeInTheDocument();
    expect(screen.getByLabelText("Deskripsi")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Kode"), "TK");
    await user.type(screen.getByLabelText("Nama"), "TK Qur'ani Bintang");
    await user.type(screen.getByLabelText("Usia minimal"), "5");
    await user.type(screen.getByLabelText("Usia maksimal"), "6");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "TK",
          name: "TK Qur'ani Bintang",
          age_min: 5,
          age_max: 6,
        })
      )
    );
    expect(onSubmit.mock.calls[0][0].description).toBeUndefined();
  });

  it("renders age group options and submits numeric select values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EntityForm entity={ENTITY_CONFIG.resources} onSubmit={onSubmit} />);

    for (const opt of AGE_GROUP_OPTIONS) {
      expect(
        screen.getByRole("option", { name: opt.label })
      ).toBeInTheDocument();
    }
    for (const opt of CATEGORY_OPTIONS) {
      expect(
        screen.getByRole("option", { name: opt.label })
      ).toBeInTheDocument();
    }

    await user.type(screen.getByLabelText("Judul"), "Kaligrafi Level 1");
    await user.selectOptions(screen.getByLabelText("Kelompok usia"), "tpa");
    await user.selectOptions(screen.getByLabelText("Kategori"), "4");
    await user.type(screen.getByLabelText("File materi"), "10");
    await user.type(screen.getByLabelText("Thumbnail"), "11");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Kaligrafi Level 1",
          age_group: "tpa",
          category_id: 4,
          file_media_id: 10,
          thumbnail_media_id: 11,
        })
      )
    );
  });
});
