import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import {
  server,
  API_BASE,
  CLASS_ROWS,
  contentCreateHandler,
  contentDeleteHandler,
  contentListHandler,
  contentPreviewHandler,
  contentUpdateHandler,
} from "./msw-server";
import { SessionProvider } from "../src/lib/admin/session";
import KontenEditorPage from "../src/app/admin/konten/[entity]/[id]/page";
import { formatTime } from "../src/lib/admin/time";

const { mockPush, mockParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockParams: { current: { entity: "classes", id: "1" } } as {
    current: Record<string, string>;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams.current,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/konten/classes/1",
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

const SCHEDULE_ROWS: Record<string, unknown>[] = [
  {
    id: 11,
    class_id: 1,
    day_name: "Senin",
    start_time: "08:00",
    end_time: "10:00",
    activity: "Tahsin",
    sort_order: 0,
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
  {
    id: 12,
    class_id: 1,
    day_name: "Rabu",
    start_time: "16:00",
    end_time: "18:00",
    activity: "Tahfizh",
    sort_order: 1,
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
];

const EMPTY_CHILDREN = [
  contentListHandler("class_schedule_items", []),
  contentListHandler("curriculum_items", []),
];

const OVERLAP_ROWS: Record<string, unknown>[] = [
  {
    id: 21,
    class_id: 1,
    day_name: "Senin",
    start_time: "08:00",
    end_time: "10:00",
    activity: "Tahsin",
    sort_order: 0,
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
  {
    id: 22,
    class_id: 1,
    day_name: "Senin",
    start_time: "09:00",
    end_time: "11:00",
    activity: "Tahfizh",
    sort_order: 1,
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
];

function renderEditor() {
  return render(
    <SessionProvider>
      <KontenEditorPage />
    </SessionProvider>
  );
}

describe("formatTime", () => {
  it("converts HH:MM to HH.MM for display", () => {
    expect(formatTime("08:00")).toBe("08.00");
    expect(formatTime("16:45")).toBe("16.45");
  });
});

describe("Schedule editor", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockPush.mockClear();
    mockParams.current = { entity: "classes", id: "1" };
  });

  it("shows the inherit-status note under the schedule section (D-SC-02)", async () => {
    server.use(contentPreviewHandler("classes", CLASS_ROWS[0]), ...EMPTY_CHILDREN);
    renderEditor();

    expect(
      await screen.findByText("Jadwal Belajar")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Jadwal tampil ke publik saat kelas sudah dipublikasikan")
    ).toBeInTheDocument();
  });

  it("adds a schedule row: saves the class first, then POSTs class_schedule_items with snake_case + class_id", async () => {
    const order: string[] = [];
    const onClassPatch = vi.fn<(_request: Request, _body: unknown) => void>(() => {
      order.push("PATCH classes");
    });
    const onSchedulePost = vi.fn<(_request: Request, _body: unknown) => void>(() => {
      order.push("POST schedule");
    });
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      ...EMPTY_CHILDREN,
      contentUpdateHandler("classes", onClassPatch),
      contentCreateHandler("class_schedule_items", onSchedulePost)
    );
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      await screen.findByRole("button", { name: "Tambah Jadwal" })
    );
    const group = screen.getByRole("group", { name: "Jadwal baris 1" });
    await user.selectOptions(within(group).getByLabelText("Hari"), "Senin");
    await user.type(within(group).getByLabelText("Waktu mulai"), "08:00");
    await user.type(within(group).getByLabelText("Waktu selesai"), "10:00");
    await user.type(within(group).getByLabelText("Kegiatan"), "Tahsin");
    await user.click(screen.getByRole("button", { name: "Simpan Draft" }));

    await waitFor(() => expect(onSchedulePost).toHaveBeenCalledTimes(1));
    expect(order).toEqual(["PATCH classes", "POST schedule"]);
    expect(onSchedulePost.mock.calls[0][1]).toEqual({
      class_id: 1,
      day_name: "Senin",
      start_time: "08:00",
      end_time: "10:00",
      activity: "Tahsin",
      sort_order: 0,
    });
    expect(mockPush).toHaveBeenCalledWith("/admin/konten/classes");
  });

  it("blocks end-before-start client-side with an inline error and no POST (D-SC-05)", async () => {
    const onClassPatch = vi.fn();
    const onSchedulePost = vi.fn();
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      ...EMPTY_CHILDREN,
      contentUpdateHandler("classes", onClassPatch),
      contentCreateHandler("class_schedule_items", onSchedulePost)
    );
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      await screen.findByRole("button", { name: "Tambah Jadwal" })
    );
    const group = screen.getByRole("group", { name: "Jadwal baris 1" });
    await user.selectOptions(within(group).getByLabelText("Hari"), "Senin");
    await user.type(within(group).getByLabelText("Waktu mulai"), "10:00");
    await user.type(within(group).getByLabelText("Waktu selesai"), "08:00");
    await user.type(within(group).getByLabelText("Kegiatan"), "Tahsin");
    await user.click(screen.getByRole("button", { name: "Simpan Draft" }));

    await waitFor(() =>
      expect(
        screen.getByText("Waktu selesai harus setelah waktu mulai")
      ).toBeInTheDocument()
    );
    expect(onClassPatch).not.toHaveBeenCalled();
    expect(onSchedulePost).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("reorders rows: sequential PATCHes send the updated sort_order", async () => {
    const order: string[] = [];
    const onClassPatch = vi.fn<(_request: Request, _body: unknown) => void>(() => {
      order.push("classes");
    });
    const onSchedulePatch = vi.fn<(_request: Request, _body: unknown) => void>(() => {
      order.push("schedule");
    });
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      contentListHandler("class_schedule_items", SCHEDULE_ROWS),
      contentListHandler("curriculum_items", []),
      contentUpdateHandler("classes", onClassPatch),
      contentUpdateHandler("class_schedule_items", onSchedulePatch)
    );
    const user = userEvent.setup();
    renderEditor();

    const firstGroup = await screen.findByRole("group", {
      name: "Jadwal baris 1",
    });
    await user.click(within(firstGroup).getByRole("button", { name: "Turun" }));
    await user.click(screen.getByRole("button", { name: "Simpan Draft" }));

    await waitFor(() => expect(onSchedulePatch).toHaveBeenCalledTimes(2));
    expect(order).toEqual(["classes", "schedule", "schedule"]);
    const urls = onSchedulePatch.mock.calls.map(
      (call) => new URL(call[0].url).pathname
    );
    expect(urls).toEqual([
      "/api/admin/class_schedule_items/12",
      "/api/admin/class_schedule_items/11",
    ]);
    expect(onSchedulePatch.mock.calls[0][1]).toEqual({
      day_name: "Rabu",
      start_time: "16:00",
      end_time: "18:00",
      activity: "Tahfizh",
      sort_order: 0,
    });
    expect(onSchedulePatch.mock.calls[1][1]).toEqual({
      day_name: "Senin",
      start_time: "08:00",
      end_time: "10:00",
      activity: "Tahsin",
      sort_order: 1,
    });
  });

  it("deletes an existing schedule row via DELETE and refetches the remaining rows", async () => {
    const onDelete = vi.fn();
    const store: Record<string, unknown>[] = [...SCHEDULE_ROWS];
    let listCalls = 0;
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      contentListHandler("class_schedule_items", store, () => {
        listCalls += 1;
      }),
      contentListHandler("curriculum_items", []),
      contentDeleteHandler("class_schedule_items", (request, params) => {
        onDelete(request, params);
        const index = store.findIndex((row) => row.id === Number(params.id));
        if (index >= 0) store.splice(index, 1);
      })
    );
    const user = userEvent.setup();
    renderEditor();

    const firstGroup = await screen.findByRole("group", {
      name: "Jadwal baris 1",
    });
    await user.click(within(firstGroup).getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
    const request = onDelete.mock.calls[0][0] as Request;
    expect(request.method).toBe("DELETE");
    expect(new URL(request.url).pathname).toBe(
      "/api/admin/class_schedule_items/11"
    );
    expect(request.headers.get("x-csrf-token")).toBe("abc123");

    await waitFor(() => expect(listCalls).toBe(2));
    expect(screen.getAllByRole("group")).toHaveLength(1);
    const remaining = screen.getByRole("group", { name: "Jadwal baris 1" });
    expect(within(remaining).getByLabelText("Kegiatan")).toHaveValue("Tahfizh");
  });

  it("drops an unsaved schedule row without calling DELETE", async () => {
    const onDelete = vi.fn();
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      ...EMPTY_CHILDREN,
      contentDeleteHandler("class_schedule_items", onDelete)
    );
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      await screen.findByRole("button", { name: "Tambah Jadwal" })
    );
    const group = screen.getByRole("group", { name: "Jadwal baris 1" });
    await user.click(within(group).getByRole("button", { name: "Hapus" }));

    await waitFor(() =>
      expect(screen.queryByRole("group", { name: "Jadwal baris 1" })).not.toBeInTheDocument()
    );
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("shows the row summary in dot format with a WIB suffix (D-SC-09)", async () => {
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      contentListHandler("class_schedule_items", SCHEDULE_ROWS),
      contentListHandler("curriculum_items", [])
    );
    renderEditor();

    await screen.findByRole("group", { name: "Jadwal baris 1" });
    expect(
      screen.getByText("Senin \u00b7 08.00\u201310.00 WIB")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Rabu \u00b7 16.00\u201318.00 WIB")
    ).toBeInTheDocument();
  });

  it("flags overlapping same-day schedule rows with an inline warning (D-SC-07)", async () => {
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      contentListHandler("class_schedule_items", OVERLAP_ROWS),
      contentListHandler("curriculum_items", [])
    );
    renderEditor();

    const firstGroup = await screen.findByRole("group", {
      name: "Jadwal baris 1",
    });
    const secondGroup = screen.getByRole("group", { name: "Jadwal baris 2" });
    expect(
      within(firstGroup).getByText(
        "Berpotensi bentrok dengan: Tahfizh (09.00\u201311.00 WIB)"
      )
    ).toBeInTheDocument();
    expect(
      within(secondGroup).getByText(
        "Berpotensi bentrok dengan: Tahsin (08.00\u201310.00 WIB)"
      )
    ).toBeInTheDocument();
  });

  it("shows no overlap warning for non-overlapping rows", async () => {
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      contentListHandler("class_schedule_items", SCHEDULE_ROWS),
      contentListHandler("curriculum_items", [])
    );
    renderEditor();

    await screen.findByRole("group", { name: "Jadwal baris 1" });
    expect(
      screen.queryByText(/Berpotensi bentrok dengan:/)
    ).not.toBeInTheDocument();
  });

  it("removes the row locally and shows a soft note when the refetch fails after a successful DELETE", async () => {
    const onDelete = vi.fn();
    const store: Record<string, unknown>[] = [...SCHEDULE_ROWS];
    let failRefetch = false;
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      http.get(`*/api/admin/class_schedule_items`, () => {
        if (failRefetch) {
          return HttpResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          );
        }
        return HttpResponse.json({ class_schedule_items: store });
      }),
      contentListHandler("curriculum_items", []),
      contentDeleteHandler("class_schedule_items", (request, params) => {
        onDelete(request, params);
        const index = store.findIndex((row) => row.id === Number(params.id));
        if (index >= 0) store.splice(index, 1);
        failRefetch = true;
      })
    );
    const user = userEvent.setup();
    renderEditor();

    const firstGroup = await screen.findByRole("group", {
      name: "Jadwal baris 1",
    });
    await user.click(within(firstGroup).getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
    expect(
      screen.getByText("Baris dihapus, daftar belum dimuat ulang")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Gagal menghapus baris \u2014 coba lagi")
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("group")).toHaveLength(1);
    const remaining = screen.getByRole("group", { name: "Jadwal baris 1" });
    expect(within(remaining).getByLabelText("Kegiatan")).toHaveValue("Tahfizh");
  });

  it("keeps the row and shows the hard error when the DELETE itself fails", async () => {
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      contentListHandler("class_schedule_items", SCHEDULE_ROWS),
      contentListHandler("curriculum_items", []),
      http.delete(
        `*/api/admin/class_schedule_items/:id`,
        () =>
          HttpResponse.json({ error: "Internal server error" }, { status: 500 })
      )
    );
    const user = userEvent.setup();
    renderEditor();

    const firstGroup = await screen.findByRole("group", {
      name: "Jadwal baris 1",
    });
    await user.click(within(firstGroup).getByRole("button", { name: "Hapus" }));

    expect(
      await screen.findByText("Gagal menghapus baris \u2014 coba lagi")
    ).toBeInTheDocument();
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(
      screen.queryByText("Baris dihapus, daftar belum dimuat ulang")
    ).not.toBeInTheDocument();
  });

  it("maps curriculum aspect options to their Indonesian labels", async () => {
    server.use(contentPreviewHandler("classes", CLASS_ROWS[0]), ...EMPTY_CHILDREN);
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      await screen.findByRole("button", { name: "Tambah Kurikulum" })
    );
    const group = screen.getByRole("group", { name: "Kurikulum baris 1" });
    const select = within(group).getByLabelText("Aspek");
    expect(
      within(select).getByRole("option", { name: "Target Qur'an" })
    ).toBeInTheDocument();
    expect(
      within(select).getByRole("option", { name: "Adab" })
    ).toBeInTheDocument();
    expect(
      within(select).getByRole("option", { name: "Akademik" })
    ).toBeInTheDocument();
    expect(
      within(select).getByRole("option", { name: "Kecakapan Hidup" })
    ).toBeInTheDocument();
  });

  it("saves a curriculum row with aspect and title", async () => {
    const onCurriculumPost = vi.fn();
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      ...EMPTY_CHILDREN,
      contentUpdateHandler("classes", vi.fn()),
      contentCreateHandler("curriculum_items", onCurriculumPost)
    );
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      await screen.findByRole("button", { name: "Tambah Kurikulum" })
    );
    const group = screen.getByRole("group", { name: "Kurikulum baris 1" });
    await user.selectOptions(within(group).getByLabelText("Aspek"), "adab");
    await user.type(within(group).getByLabelText("Judul"), "Adab kepada Guru");
    await user.click(screen.getByRole("button", { name: "Simpan Draft" }));

    await waitFor(() => expect(onCurriculumPost).toHaveBeenCalledTimes(1));
    expect(onCurriculumPost.mock.calls[0][1]).toEqual({
      class_id: 1,
      aspect: "adab",
      title: "Adab kepada Guru",
      sort_order: 0,
    });
  });
});
