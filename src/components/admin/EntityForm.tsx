"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { EntityConfig, FieldOption, FieldSpec } from "@/lib/admin/entities";
import { slugify } from "@/lib/admin/slug";
import { Button } from "@/components/ui/Button";

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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(entity.createSchema as z.ZodType<FormValues, FormValues>),
    defaultValues: (initialValues ?? {}) as FormValues,
  });

  const [loadedOptions, setLoadedOptions] = useState<
    Record<string, FieldOption[]>
  >({});

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
      onSubmit={handleSubmit((values) => onSubmit(clean(values)))}
    >
      {entity.fields.map((field) => {
        const id = `${entity.key}-${field.name}`;
        const error = errors[field.name];
        const numeric = isNumericField(entity, field);
        const slugTarget = entity.fields.find((f) => f.slugFrom === field.name);
        let control: ReactNode;
        switch (field.type) {
          case "text":
            control = (
              <input
                id={id}
                type="text"
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
            control = (
              <textarea
                id={id}
                rows={4}
                className={inputClasses}
                {...register(field.name)}
              />
            );
            break;
          case "number":
            control = (
              <input
                id={id}
                type="number"
                className={inputClasses}
                {...register(field.name, { valueAsNumber: true })}
              />
            );
            break;
          case "select":
            control = (
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
            control = (
              <div className="flex items-center gap-2">
                <input
                  id={id}
                  type="number"
                  className={inputClasses}
                  placeholder="ID media"
                  {...register(field.name, { valueAsNumber: true })}
                />
                <Button type="button" variant="outline" disabled>
                  Pilih Media
                </Button>
              </div>
            );
            break;
          default:
            control = null;
        }
        return (
          <div key={field.name}>
            <label
              htmlFor={id}
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              {field.label}
            </label>
            {control}
            {field.helper ? (
              <p className="mt-1 text-xs text-slate-500">{field.helper}</p>
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
