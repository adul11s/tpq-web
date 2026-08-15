"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useForm,
  useWatch,
  type Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ENTITY_CONFIG,
  type EntityConfig,
  type FieldOption,
  type FieldSpec,
} from "@/lib/admin/entities";
import { slugify } from "@/lib/admin/slug";
import { Button } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";

export interface EntityFormProps {
  entity: EntityConfig;
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  submitLabel?: string;
  submitting?: boolean;
}

type FormValues = Record<string, unknown>;

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60";

function isNumericField(entity: EntityConfig, field: FieldSpec): boolean {
  if (field.type === "select") {
    const shape = (entity.createSchema as { shape?: Record<string, unknown> })
      .shape;
    return shape?.[field.name] instanceof z.ZodNumber;
  }
  return field.type === "number" || field.type === "media";
}

function clean(values: FormValues): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (
      value === undefined ||
      value === "" ||
      (typeof value === "number" && Number.isNaN(value))
    ) {
      continue;
    }
    output[key] = value;
  }
  return output;
}

const CHILD_ENTITY: Record<string, string> = {
  schedule: "class_schedule_items",
  curriculum: "curriculum_items",
};

const EDITABLE_SKIP = new Set(["id", "class_id", "sort_order"]);

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

interface RowState {
  id?: number;
  values: Record<string, unknown>;
  errors: Record<string, string>;
}

export interface RowEditorHandle {
  validate: () => boolean;
  getRows: () => Record<string, unknown>[];
}

interface RowEditorProps {
  field: FieldSpec;
  childEntity: EntityConfig;
  initialRows?: Record<string, unknown>[];
}

function validateRow(
  kind: "schedule" | "curriculum",
  row: RowState
): Record<string, string> {
  const errors: Record<string, string> = {};
  const values = row.values;
  if (kind === "schedule") {
    if (!String(values.day_name ?? "").trim()) {
      errors.day_name = "Hari wajib diisi";
    }
    const start = String(values.start_time ?? "");
    const end = String(values.end_time ?? "");
    if (!start) {
      errors.start_time = "Waktu mulai wajib diisi";
    } else if (!TIME_RE.test(start)) {
      errors.start_time = "Waktu mulai format HH:MM";
    }
    if (!end) {
      errors.end_time = "Waktu selesai wajib diisi";
    } else if (!TIME_RE.test(end)) {
      errors.end_time = "Waktu selesai format HH:MM";
    }
    if (!errors.start_time && !errors.end_time && end <= start) {
      errors.end_time = "Waktu selesai harus setelah waktu mulai";
    }
    if (!String(values.activity ?? "").trim()) {
      errors.activity = "Kegiatan wajib diisi";
    }
  } else {
    if (!String(values.aspect ?? "")) {
      errors.aspect = "Aspek wajib dipilih";
    }
    if (!String(values.title ?? "").trim()) {
      errors.title = "Judul wajib diisi";
    }
  }
  return errors;
}

function editableFields(childEntity: EntityConfig): FieldSpec[] {
  return childEntity.fields.filter((field) => !EDITABLE_SKIP.has(field.name));
}

function pickEditable(
  childEntity: EntityConfig,
  row: Record<string, unknown>
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of editableFields(childEntity)) {
    const value = row[field.name];
    values[field.name] = value === null || value === undefined ? "" : String(value);
  }
  return values;
}

const RowEditor = forwardRef<RowEditorHandle, RowEditorProps>(function RowEditor(
  { field, childEntity, initialRows },
  ref
) {
  const isSchedule = field.type === "schedule";
  const [rows, setRows] = useState<RowState[]>(() =>
    [...(initialRows ?? [])]
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
      .map((row) => ({
        id: row.id as number | undefined,
        values: pickEditable(childEntity, row),
        errors: {},
      }))
  );

  useImperativeHandle(
    ref,
    () => ({
      validate() {
        const next = rows.map((row) => ({
          ...row,
          errors: validateRow(field.type as "schedule" | "curriculum", row),
        }));
        setRows(next);
        return next.every((row) => Object.keys(row.errors).length === 0);
      },
      getRows() {
        return rows.map((row, index) => ({
          ...(row.id !== undefined ? { id: row.id } : {}),
          ...row.values,
          sort_order: index,
        }));
      },
    }),
    [rows, field.type]
  );

  function updateRow(index: number, name: string, value: string) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, values: { ...row.values, [name]: value }, errors: {} }
          : row
      )
    );
  }

  function addRow() {
    const empty: Record<string, unknown> = {};
    for (const item of editableFields(childEntity)) {
      empty[item.name] = "";
    }
    setRows((prev) => [...prev, { values: empty, errors: {} }]);
  }

  function moveRow(index: number, direction: -1 | 1) {
    setRows((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const emptyText = isSchedule
    ? "Belum ada jadwal \u2014 tambah kegiatan pertama."
    : "Belum ada kurikulum \u2014 tambah item pertama.";
  const addLabel = isSchedule ? "Tambah Jadwal" : "Tambah Kurikulum";
  const groupLabel = isSchedule ? "Jadwal" : "Kurikulum";

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        rows.map((row, index) => (
          <div
            key={index}
            role="group"
            aria-label={`${groupLabel} baris ${index + 1}`}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {editableFields(childEntity).map((item) => (
                <div key={item.name}>
                  <label
                    htmlFor={`${field.name}-${index}-${item.name}`}
                    className="mb-1 block text-sm font-semibold text-slate-700"
                  >
                    {item.label}
                  </label>
                  {item.type === "select" ? (
                    <select
                      id={`${field.name}-${index}-${item.name}`}
                      className={inputClasses}
                      value={String(row.values[item.name] ?? "")}
                      onChange={(event) =>
                        updateRow(index, item.name, event.target.value)
                      }
                    >
                      <option value="">Pilih\u2026</option>
                      {(item.options ?? []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : item.type === "textarea" ? (
                    <textarea
                      id={`${field.name}-${index}-${item.name}`}
                      rows={2}
                      className={inputClasses}
                      value={String(row.values[item.name] ?? "")}
                      onChange={(event) =>
                        updateRow(index, item.name, event.target.value)
                      }
                    />
                  ) : (
                    <input
                      id={`${field.name}-${index}-${item.name}`}
                      type="text"
                      className={inputClasses}
                      value={String(row.values[item.name] ?? "")}
                      placeholder={item.time ? "HH:MM" : undefined}
                      maxLength={item.time ? 5 : undefined}
                      onChange={(event) =>
                        updateRow(index, item.name, event.target.value)
                      }
                    />
                  )}
                  {row.errors[item.name] ? (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {row.errors[item.name]}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === 0}
                onClick={() => moveRow(index, -1)}
              >
                Naik
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === rows.length - 1}
                onClick={() => moveRow(index, 1)}
              >
                Turun
              </Button>
            </div>
          </div>
        ))
      )}
      <Button type="button" variant="secondary" size="sm" onClick={addRow}>
        {addLabel}
      </Button>
    </div>
  );
});

interface EmptyHelperProps {
  control: Control<FormValues>;
  name: string;
  text: string;
}

function EmptyHelper({ control, name, text }: EmptyHelperProps) {
  const value = useWatch({ control, name });
  const empty =
    value === undefined || value === null || String(value).trim() === "";
  return empty ? (
    <p className="mt-1 text-xs text-slate-500">{text}</p>
  ) : null;
}

export function EntityForm({
  entity,
  initialValues,
  onSubmit,
  submitLabel,
  submitting = false,
}: EntityFormProps) {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(entity.createSchema as z.ZodType<FormValues, FormValues>),
    defaultValues: (initialValues ?? {}) as FormValues,
  });

  const [loadedOptions, setLoadedOptions] = useState<
    Record<string, FieldOption[]>
  >({});

  const childRefs = useRef<Record<string, RowEditorHandle>>({});
  const childFields = entity.fields.filter(
    (field) => field.type === "schedule" || field.type === "curriculum"
  );

  async function handleFormSubmit(values: FormValues) {
    for (const field of childFields) {
      const editor = childRefs.current[field.name];
      if (editor && !editor.validate()) return;
    }
    const payload: FormValues = { ...values };
    for (const field of childFields) {
      const editor = childRefs.current[field.name];
      if (editor) payload[field.name] = editor.getRows();
    }
    await onSubmit(clean(payload));
  }

  useEffect(() => {
    let active = true;
    for (const field of entity.fields) {
      if (!field.loadOptions) continue;
      field
        .loadOptions()
        .then((options) => {
          if (active) {
            setLoadedOptions((prev) => ({ ...prev, [field.name]: options }));
          }
        })
        .catch(() => {
          // keep the static fallback options when the endpoint is unavailable
        });
    }
    return () => {
      active = false;
    };
  }, [entity]);

  function handleSlugSourceBlur(source: string, target: string) {
    const currentSlug = getValues(target) as string | undefined;
    if (currentSlug?.trim()) return;
    const sourceValue = getValues(source) as string | undefined;
    if (!sourceValue?.trim()) return;
    setValue(target, slugify(sourceValue));
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        void handleSubmit(handleFormSubmit)(event);
      }}
    >
      {entity.fields.map((field) => {
        const id = `${entity.key}-${field.name}`;
        const error = errors[field.name];
        const numeric = isNumericField(entity, field);
        const slugTarget = entity.fields.find((f) => f.slugFrom === field.name);
        let fieldControl: ReactNode;
        switch (field.type) {
          case "text":
            fieldControl = (
              <input
                id={id}
                type="text"
                readOnly={Boolean(field.readonlyAfterCreate && initialValues)}
                className={inputClasses}
                {...register(field.name, {
                  onBlur: slugTarget
                    ? () => handleSlugSourceBlur(field.name, slugTarget.name)
                    : undefined,
                })}
              />
            );
            break;
          case "textarea":
            fieldControl = (
              <textarea
                id={id}
                rows={4}
                dir={field.arabic ? "rtl" : undefined}
                className={
                  field.arabic
                    ? `${inputClasses} text-right font-arabic text-lg leading-loose`
                    : inputClasses
                }
                {...register(field.name)}
              />
            );
            break;
          case "number":
            fieldControl = (
              <input
                id={id}
                type="number"
                className={inputClasses}
                {...register(field.name, { valueAsNumber: true })}
              />
            );
            break;
          case "select":
            fieldControl = (
              <select
                id={id}
                className={inputClasses}
                {...register(field.name, { valueAsNumber: numeric })}
              >
                <option value="">Pilih\u2026</option>
                {(loadedOptions[field.name] ?? field.options)?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
            break;
          case "media":
            fieldControl = (
              <MediaPicker
                triggerId={id}
                kind={field.mediaKind ?? "all"}
                value={(getValues(field.name) as number | null) ?? null}
                onChange={(mediaId) => setValue(field.name, mediaId)}
              />
            );
            break;
          case "schedule":
          case "curriculum": {
            const childKey = CHILD_ENTITY[field.type];
            fieldControl = (
              <RowEditor
                field={field}
                childEntity={ENTITY_CONFIG[childKey]}
                initialRows={
                  (initialValues?.[field.name] as
                    | Record<string, unknown>[]
                    | undefined) ?? []
                }
                ref={(handle) => {
                  if (handle) childRefs.current[field.name] = handle;
                  else delete childRefs.current[field.name];
                }}
              />
            );
            break;
          }
          default:
            fieldControl = null;
        }
        return (
          <div key={field.name}>
            <label
              htmlFor={id}
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              {field.label}
            </label>
            {fieldControl}
            {field.helper ? (
              <p className="mt-1 text-xs text-slate-500">{field.helper}</p>
            ) : null}
            {field.helperWhenEmpty ? (
              <EmptyHelper
                control={control}
                name={field.name}
                text={field.helperWhenEmpty}
              />
            ) : null}
            {error ? (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {String(error.message ?? "Wajib diisi")}
              </p>
            ) : null}
          </div>
        );
      })}
      <div className="pt-2">
        <Button type="submit" loading={submitting}>
          {submitLabel ?? "Simpan"}
        </Button>
      </div>
    </form>
  );
}
