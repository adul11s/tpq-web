import { adminFetch } from "./admin-client";
import type { AdminList, ContentStatus } from "../types/admin";

export interface ContentApiError {
  message: string;
  fields?: Record<string, string>;
}

export function toApiError(error: unknown): ContentApiError {
  const apiError = error as { message?: string; fields?: Record<string, string> };
  return {
    message: apiError.message ?? "Terjadi kesalahan",
    fields: apiError.fields,
  };
}

export const contentApi = {
  list<T = Record<string, unknown>>(
    entity: string,
    opts?: { status?: ContentStatus }
  ): Promise<AdminList<T>> {
    const query = opts?.status ? `?status=${opts.status}` : "";
    return adminFetch<AdminList<T>>(`/admin/${entity}${query}`);
  },

  create<T = Record<string, unknown>>(
    entity: string,
    body: Record<string, unknown>
  ): Promise<T> {
    return adminFetch<T>(`/admin/${entity}`, { method: "POST", body });
  },

  update<T = Record<string, unknown>>(
    entity: string,
    id: number,
    body: Record<string, unknown>
  ): Promise<T> {
    return adminFetch<T>(`/admin/${entity}/${id}`, { method: "PATCH", body });
  },

  publish<T = Record<string, unknown>>(entity: string, id: number): Promise<T> {
    return adminFetch<T>(`/admin/${entity}/${id}/publish`, { method: "POST" });
  },

  archive<T = Record<string, unknown>>(entity: string, id: number): Promise<T> {
    return adminFetch<T>(`/admin/${entity}/${id}/archive`, { method: "POST" });
  },

  preview<T = Record<string, unknown>>(entity: string, id: number): Promise<T> {
    return adminFetch<T>(`/admin/${entity}/${id}/preview`);
  },
};

function cleanRowValues(row: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "number" && Number.isNaN(value))
    ) {
      continue;
    }
    output[key] = value;
  }
  return output;
}

export async function saveChildRows(
  entity: string,
  classId: number,
  rows: Record<string, unknown>[]
): Promise<void> {
  for (const row of rows) {
    const id = row.id;
    const fields = cleanRowValues(row);
    delete fields.id;
    delete fields.class_id;
    if (id !== undefined && id !== null && id !== "") {
      await contentApi.update(entity, Number(id), fields);
    } else {
      await contentApi.create(entity, { ...fields, class_id: classId });
    }
  }
}
