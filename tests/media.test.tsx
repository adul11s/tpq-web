import React, { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  mediaListHandler,
  mediaUploadError,
  mediaUploadHandler,
  server,
} from "./msw-server";
import MediaPage from "../src/app/admin/media/page";
import { MediaPicker } from "../src/components/admin/MediaPicker";

let fetchSpy: ReturnType<typeof vi.spyOn> | undefined;

afterEach(() => {
  fetchSpy?.mockRestore();
  fetchSpy = undefined;
});

const API_413_MESSAGE =
  "File terlalu besar (maks 5 MB). Kompres PDF Anda lalu coba lagi.";

function bigFile(): File {
  return new File(
    [new Uint8Array(5 * 1024 * 1024 + 1)],
    "laporan-bulanan.pdf",
    { type: "application/pdf" }
  );
}

type FetchCall = [string | URL | Request, RequestInit];

function uploadCall(fetchMock: ReturnType<typeof vi.spyOn>): FetchCall {
  const call = fetchMock.mock.calls.find(
    ([url, init]: FetchCall) =>
      String(url).endsWith("/admin/media") && init?.method === "POST"
  ) as FetchCall | undefined;
  expect(call).toBeDefined();
  return call as FetchCall;
}

describe("Media library", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
  });

  it("uploads a file as FormData with CSRF header and refreshes the library", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
    const onUpload = vi.fn();
    const onList = vi.fn();
    server.use(mediaUploadHandler(onUpload), mediaListHandler(onList));
    const user = userEvent.setup();
    render(<MediaPage />);

    expect(await screen.findByText("laporan-bulanan.pdf")).toBeInTheDocument();

    const file = new File(["hello"], "laporan-bulanan.pdf", {
      type: "application/pdf",
    });
    await user.upload(screen.getByLabelText("Pilih file untuk diunggah"), file);

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
    const wireRequest = onUpload.mock.calls[0][0] as Request;
    expect(wireRequest.method).toBe("POST");
    expect(wireRequest.headers.get("x-csrf-token")).toBe("abc123");
    expect(
      wireRequest.headers.get("content-type")
    ).toMatch(/^multipart\/form-data/);

    const [, init] = uploadCall(fetchSpy);
    expect(init.body).toBeInstanceOf(FormData);
    const formData = init.body as FormData;
    expect(formData.get("file")).toBeInstanceOf(File);
    expect((formData.get("file") as File).name).toBe("laporan-bulanan.pdf");

    await waitFor(() => expect(onList).toHaveBeenCalledTimes(2));
  });

  it("uploads a dropped file via the drag-drop zone", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
    server.use(mediaUploadHandler(), mediaListHandler());
    render(<MediaPage />);

    await screen.findByText("laporan-bulanan.pdf");
    const zone = screen.getByText("Tarik file ke sini untuk mengunggah");
    const file = new File(["hello"], "foto-kegiatan.jpg", {
      type: "image/jpeg",
    });
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });

    await waitFor(() => expect(fetchSpy.mock.calls.length).toBeGreaterThan(1));
    const [, init] = uploadCall(fetchSpy);
    const formData = init.body as FormData;
    expect((formData.get("file") as File).name).toBe("foto-kegiatan.jpg");
  });

  it("warns before uploading a file larger than 5 MB without calling fetch", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
    server.use(mediaUploadHandler(), mediaListHandler());
    const user = userEvent.setup();
    render(<MediaPage />);

    await screen.findByText("laporan-bulanan.pdf");
    fetchSpy.mockClear();

    await user.upload(
      screen.getByLabelText("Pilih file untuk diunggah"),
      bigFile()
    );

    expect(
      await screen.findByText(/File lebih dari 5 MB/i)
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects files with a non-allowed mime type inline without calling fetch", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
    server.use(mediaUploadHandler(), mediaListHandler());
    render(<MediaPage />);

    await screen.findByText("laporan-bulanan.pdf");
    fetchSpy.mockClear();

    const exe = new File(["MZ"], "virus.exe", { type: "application/x-msdownload" });
    fireEvent.change(screen.getByLabelText("Pilih file untuk diunggah"), {
      target: { files: [exe] },
    });

    expect(
      await screen.findByText(/Format file tidak didukung/i)
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByText(/Format file tidak didukung/i)).toHaveTextContent(
      "Format file tidak didukung \u2014 gunakan PDF, JPG, PNG, atau GIF."
    );
  });

  it("renders the API 413 message verbatim with compression guidance", async () => {
    server.use(
      mediaUploadError(413, { error: API_413_MESSAGE }),
      mediaListHandler()
    );
    const user = userEvent.setup();
    render(<MediaPage />);

    await screen.findByText("laporan-bulanan.pdf");
    const file = new File(["hello"], "laporan-bulanan.pdf", {
      type: "application/pdf",
    });
    await user.upload(screen.getByLabelText("Pilih file untuk diunggah"), file);

    expect(await screen.findByText(API_413_MESSAGE)).toBeInTheDocument();
    expect(
      screen.getByText(/Smallpdf atau docsmall/i)
    ).toBeInTheDocument();
  });
});

describe("MediaPicker", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
  });

  function ControlledPicker({
    kind,
  }: {
    kind: "pdf" | "image" | "all";
  }) {
    const [value, setValue] = useState<number | null>(null);
    return (
      <MediaPicker
        kind={kind}
        value={value}
        onChange={(id) => setValue(id)}
      />
    );
  }

  it("filters rows by kind and calls onChange with the selected id, closing the modal", async () => {
    server.use(mediaListHandler());
    const user = userEvent.setup();
    render(<ControlledPicker kind="pdf" />);

    await user.click(screen.getByRole("button", { name: "Pilih Media" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("laporan-bulanan.pdf")).toBeInTheDocument();
    expect(screen.queryByText("foto-kegiatan.jpg")).not.toBeInTheDocument();

    await user.click(screen.getByText("laporan-bulanan.pdf"));

    expect(
      await screen.findByRole("button", { name: "laporan-bulanan.pdf" })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("searches by original_name and keeps rows of other kinds for kind=all", async () => {
    server.use(mediaListHandler());
    const user = userEvent.setup();
    render(<ControlledPicker kind="all" />);

    await user.click(screen.getByRole("button", { name: "Pilih Media" }));
    await user.type(await screen.findByLabelText("Cari media"), "laporan");

    expect(screen.getByText("laporan-bulanan.pdf")).toBeInTheDocument();
    expect(screen.queryByText("foto-kegiatan.jpg")).not.toBeInTheDocument();

    await user.click(screen.getByText("laporan-bulanan.pdf"));

    expect(
      await screen.findByRole("button", { name: "laporan-bulanan.pdf" })
    ).toBeInTheDocument();
  });

  it("clears the selected asset via Hapus pilihan and calls onChange(null)", async () => {
    server.use(mediaListHandler());
    const user = userEvent.setup();
    render(<ControlledPicker kind="pdf" />);

    await user.click(screen.getByRole("button", { name: "Pilih Media" }));
    await user.click(await screen.findByText("laporan-bulanan.pdf"));

    expect(
      await screen.findByRole("button", { name: "laporan-bulanan.pdf" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hapus pilihan" }));

    expect(
      await screen.findByRole("button", { name: "Pilih Media" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "laporan-bulanan.pdf" })
    ).not.toBeInTheDocument();
  });
});
