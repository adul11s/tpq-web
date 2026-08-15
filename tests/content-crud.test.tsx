import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  server,
  adminMeAs,
  CLASS_ROWS,
  contentListHandler,
  contentPreviewHandler,
  contentCreateHandler,
  contentCreateError,
  contentUpdateHandler,
  contentPublishHandler,
  contentArchiveHandler,
} from "./msw-server";
import { SessionProvider } from "../src/lib/admin/session";
import KontenIndexPage from "../src/app/admin/konten/page";
import KontenListPage from "../src/app/admin/konten/[entity]/page";
import KontenEditorPage from "../src/app/admin/konten/[entity]/[id]/page";
import KontenNewPage from "../src/app/admin/konten/[entity]/baru/page";

const { mockPush, mockReplace, mockParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockParams: { current: { entity: "classes" } } as { current: Record<string, string> },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useParams: () => mockParams.current,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/konten/classes",
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

function renderList() {
  return render(
    <SessionProvider>
      <KontenListPage />
    </SessionProvider>
  );
}

describe("Konten index page", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("shows every entity tile with a Buka link for admin, including site settings", async () => {
    render(
      <SessionProvider>
        <KontenIndexPage />
      </SessionProvider>
    );

    expect(await screen.findByRole("link", { name: /Kelas/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Materi/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Guru/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Pengaturan Situs/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kelas/ })).toHaveAttribute(
      "href",
      "/admin/konten/classes"
    );
    expect(screen.getByRole("link", { name: /Pengaturan Situs/ })).toHaveAttribute(
      "href",
      "/admin/konten/site_settings"
    );
    expect(screen.getAllByRole("link", { name: /Buka/ })).toHaveLength(10);
  });

  it("hides site_settings from content_manager (mirrors the menu gating)", async () => {
    server.use(adminMeAs("content_manager"));
    render(
      <SessionProvider>
        <KontenIndexPage />
      </SessionProvider>
    );

    expect(await screen.findByRole("link", { name: /Kelas/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Guru/ })).toBeInTheDocument();
    expect(screen.queryByText("Pengaturan Situs")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /site_settings/ })
    ).not.toBeInTheDocument();
  });
});

describe("Konten role gates", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("blocks content_manager from the site_settings list page with a notice + redirect", async () => {
    mockParams.current = { entity: "site_settings" };
    server.use(adminMeAs("content_manager"));
    renderList();

    expect(
      await screen.findByText("Halaman ini khusus untuk admin.")
    ).toBeInTheDocument();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
    expect(
      screen.queryByRole("button", { name: "Buat Baru" })
    ).not.toBeInTheDocument();
  });

  it("blocks content_manager from the site_settings editor page", async () => {
    mockParams.current = { entity: "site_settings", id: "1" };
    server.use(adminMeAs("content_manager"));
    render(
      <SessionProvider>
        <KontenEditorPage />
      </SessionProvider>
    );

    expect(
      await screen.findByText("Halaman ini khusus untuk admin.")
    ).toBeInTheDocument();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
  });

  it("blocks content_manager from the site_settings create page", async () => {
    mockParams.current = { entity: "site_settings" };
    server.use(adminMeAs("content_manager"));
    render(
      <SessionProvider>
        <KontenNewPage />
      </SessionProvider>
    );

    expect(
      await screen.findByText("Halaman ini khusus untuk admin.")
    ).toBeInTheDocument();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
  });
});

describe("Konten list page", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockPush.mockClear();
    mockParams.current = { entity: "classes" };
  });

  it("renders class rows with status chips and status badges", async () => {
    server.use(contentListHandler("classes", CLASS_ROWS));
    renderList();

    await screen.findByText("TK Qur'ani Bintang");
    expect(screen.getByText("TPA Qur'ani Bintang")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Semua" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Draft" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publik" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Arsip" })).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(within(table).getByText("Draft")).toBeInTheDocument();
    expect(within(table).getByText("Publik")).toBeInTheDocument();

    const createLink = screen.getByRole("link", { name: "Buat Baru" });
    expect(createLink).toHaveAttribute("href", "/admin/konten/classes/baru");
  });

  it("hides Publish/Archive actions for content_manager (D-CM-12)", async () => {
    server.use(
      adminMeAs("content_manager"),
      contentListHandler("classes", CLASS_ROWS)
    );
    renderList();

    await screen.findByText("TK Qur'ani Bintang");
    expect(
      screen.queryByRole("button", { name: "Terbitkan" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Arsipkan" })
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(2);
  });

  it("publishes a draft via POST with the CSRF header", async () => {
    const onRequest = vi.fn();
    server.use(
      contentListHandler("classes", CLASS_ROWS),
      contentPublishHandler("classes", onRequest)
    );
    const user = userEvent.setup();
    renderList();

    await screen.findByText("TK Qur'ani Bintang");
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    const request = onRequest.mock.calls[0][0] as Request;
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe(
      "/api/v1/admin/classes/1/publish"
    );
    expect(request.headers.get("x-csrf-token")).toBe("abc123");
  });

  it("archives a published row via POST with the CSRF header", async () => {
    const onRequest = vi.fn();
    server.use(
      contentListHandler("classes", CLASS_ROWS),
      contentArchiveHandler("classes", onRequest)
    );
    const user = userEvent.setup();
    renderList();

    await screen.findByText("TK Qur'ani Bintang");
    await user.click(screen.getByRole("button", { name: "Arsipkan" }));

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    const request = onRequest.mock.calls[0][0] as Request;
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe(
      "/api/v1/admin/classes/2/archive"
    );
    expect(request.headers.get("x-csrf-token")).toBe("abc123");
  });

  it("filters via the A3 ?status= param when a chip is clicked", async () => {
    const queries: URLSearchParams[] = [];
    server.use(
      contentListHandler("classes", CLASS_ROWS, (params) =>
        queries.push(params)
      )
    );
    const user = userEvent.setup();
    renderList();

    await screen.findByText("TK Qur'ani Bintang");
    await waitFor(() => expect(queries).toHaveLength(1));
    expect(queries[0].get("status")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Draft" }));
    await waitFor(() => expect(queries).toHaveLength(2));
    expect(queries[1].get("status")).toBe("draft");

    await user.click(screen.getByRole("button", { name: "Semua" }));
    await waitFor(() => expect(queries).toHaveLength(3));
    expect(queries[2].get("status")).toBeNull();
  });
});

describe("Konten create page", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockPush.mockClear();
    mockParams.current = { entity: "classes" };
  });

  it("creates a class as draft with a snake_case body and navigates back on 201", async () => {
    const onRequest = vi.fn();
    server.use(contentCreateHandler("classes", onRequest));
    const user = userEvent.setup();
    render(
      <SessionProvider>
        <KontenNewPage />
      </SessionProvider>
    );

    await user.type(await screen.findByLabelText("Kode"), "TK");
    await user.type(screen.getByLabelText("Nama"), "TK Qur'ani Bintang");
    await user.type(screen.getByLabelText("Usia minimal"), "5");
    await user.type(screen.getByLabelText("Usia maksimal"), "6");
    await user.click(screen.getByRole("button", { name: "Simpan Draft" }));

    await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1));
    const request = onRequest.mock.calls[0][0] as Request;
    expect(request.method).toBe("POST");
    expect(request.headers.get("x-csrf-token")).toBe("abc123");
    expect(onRequest.mock.calls[0][1]).toMatchObject({
      code: "TK",
      name: "TK Qur'ani Bintang",
      age_min: 5,
      age_max: 6,
    });
    expect(mockPush).toHaveBeenCalledWith("/admin/konten/classes");
  });

  it("shows per-field server errors from a 422 response", async () => {
    server.use(
      contentCreateError("classes", 422, {
        error: "Gagal menyimpan",
        fields: { code: "Kode sudah dipakai" },
      })
    );
    const user = userEvent.setup();
    render(
      <SessionProvider>
        <KontenNewPage />
      </SessionProvider>
    );

    await user.type(await screen.findByLabelText("Kode"), "TK");
    await user.type(screen.getByLabelText("Nama"), "TK Qur'ani Bintang");
    await user.type(screen.getByLabelText("Usia minimal"), "5");
    await user.type(screen.getByLabelText("Usia maksimal"), "6");
    await user.click(screen.getByRole("button", { name: "Simpan Draft" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Kode sudah dipakai")
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Gagal menyimpan");
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("Konten editor page", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockPush.mockClear();
    mockParams.current = { entity: "classes", id: "1" };
  });

  it("loads :id/preview, shows admin Publish, and saves draft via PATCH", async () => {
    const onPatch = vi.fn();
    server.use(
      contentPreviewHandler("classes", CLASS_ROWS[0]),
      contentListHandler("class_schedule_items", []),
      contentListHandler("curriculum_items", []),
      contentUpdateHandler("classes", onPatch)
    );
    const user = userEvent.setup();
    render(
      <SessionProvider>
        <KontenEditorPage />
      </SessionProvider>
    );

    const nameInput = await screen.findByLabelText("Nama");
    expect(nameInput).toHaveValue("TK Qur'ani Bintang");
    expect(
      screen.getByRole("button", { name: "Terbitkan" })
    ).toBeInTheDocument();

    await user.clear(nameInput);
    await user.type(nameInput, "TK Qur'ani Nurul Huda");
    await user.click(screen.getByRole("button", { name: "Simpan Draft" }));

    await waitFor(() => expect(onPatch).toHaveBeenCalledTimes(1));
    const request = onPatch.mock.calls[0][0] as Request;
    expect(request.method).toBe("PATCH");
    expect(new URL(request.url).pathname).toBe("/api/v1/admin/classes/1");
    expect(request.headers.get("x-csrf-token")).toBe("abc123");
    expect(onPatch.mock.calls[0][1]).toMatchObject({
      name: "TK Qur'ani Nurul Huda",
      code: "TK",
    });
    expect(mockPush).toHaveBeenCalledWith("/admin/konten/classes");
  });

  it("sends null for a cleared optional field and omits untouched empty fields", async () => {
    const onPatch = vi.fn();
    const row = {
      ...CLASS_ROWS[0],
      name_en: "TK Qur'ani Bintang (EN)",
      hours: "08.00-10.00 WIB",
      capacity: "24",
    };
    server.use(
      contentPreviewHandler("classes", row),
      contentListHandler("class_schedule_items", []),
      contentListHandler("curriculum_items", []),
      contentUpdateHandler("classes", onPatch)
    );
    const user = userEvent.setup();
    render(
      <SessionProvider>
        <KontenEditorPage />
      </SessionProvider>
    );

    const nameEnInput = await screen.findByLabelText("Nama (EN)");
    await user.clear(nameEnInput);
    await user.click(screen.getByRole("button", { name: "Simpan Draft" }));

    await waitFor(() => expect(onPatch).toHaveBeenCalledTimes(1));
    const body = onPatch.mock.calls[0][1] as Record<string, unknown>;
    expect(body.name_en).toBeNull();
    expect(body.code).toBe("TK");
    expect(body.description).toBeUndefined();
    expect(body.fees).toBeUndefined();
  });
});
