"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { submitInquiry } from "@/lib/data/pages";
import { trackInquirySubmitted } from "@/lib/gtag";
import { localizedHref, type Lang } from "@/lib/lang";
import { waLink } from "@/lib/wa";
import { PHONE_REGEX } from "@/lib/types/inquiry";
import type { ClassSummary } from "@/lib/types/class";
import type { ApiError } from "@/lib/api/client";

interface InquiryFormProps {
  lang: Lang;
  classes: ClassSummary[];
  privacyPolicyVersion: string;
  privacyPolicyPath: string;
}

const inquirySchema = z.object({
  parent_name: z
    .string()
    .min(2, "Nama harus 2–150 karakter")
    .max(150, "Nama harus 2–150 karakter"),
  phone: z.string().regex(PHONE_REGEX, "Nomor HP tidak valid"),
  whatsapp: z
    .string()
    .regex(PHONE_REGEX, "Nomor WhatsApp tidak valid")
    .optional()
    .or(z.literal("")),
  child_age: z.string().max(30, "Maksimal 30 karakter").optional(),
  program_class_id: z.string().optional(),
  message: z.string().max(2000, "Maksimal 2000 karakter").optional(),
  consent_given: z.boolean().refine((value) => value === true, {
    message: "Anda harus menyetujui Kebijakan Privasi",
  }),
  website: z.string().optional(),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30";
const labelClasses = "block text-sm font-medium text-slate-700";

export function InquiryForm({
  lang,
  classes,
  privacyPolicyVersion,
  privacyPolicyPath,
}: InquiryFormProps) {
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      parent_name: "",
      phone: "",
      whatsapp: "",
      child_age: "",
      program_class_id: "",
      message: "",
      consent_given: false,
      website: "",
    },
  });

  async function onSubmit(values: InquiryFormValues) {
    setServerError(null);
    const isHoneypot = Boolean(values.website);

    try {
      const response = await submitInquiry({
        parent_name: values.parent_name.trim(),
        phone: values.phone.trim(),
        whatsapp: values.whatsapp?.trim() || undefined,
        child_age: values.child_age?.trim() || undefined,
        program_class_id: values.program_class_id
          ? Number(values.program_class_id)
          : undefined,
        message: values.message?.trim() || undefined,
        consent_given: true,
        privacy_policy_version: privacyPolicyVersion,
        website: isHoneypot ? values.website : undefined,
      });

      if (!isHoneypot) {
        trackInquirySubmitted({ event: "inquiry_submitted", language: lang });
      }
      setSubmittedId(response.id);
    } catch (error) {
      const apiError = error as ApiError & { fields?: Record<string, string> };
      if (apiError.status === 422 && apiError.fields) {
        Object.entries(apiError.fields).forEach(([field, message]) => {
          if (field in values) {
            setError(field as keyof InquiryFormValues, { message });
          }
        });
      }
      if (apiError.status === 429) {
        setServerError(
          lang === "en"
            ? "Too many submissions. Please try again later."
            : "Terlalu banyak pengajuan, coba lagi nanti",
        );
      } else if (apiError.status !== 422) {
        setServerError(apiError.message);
      }
    }
  }

  if (submittedId !== null) {
    const waMessage = [
      `Halo, saya ${getValues("parent_name") ?? ""}`,
      getValues("child_age") ? `Usia anak: ${getValues("child_age")}` : null,
      getValues("message") ? `Pertanyaan: ${getValues("message")}` : null,
    ]
      .filter(Boolean)
      .join(". ");

    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h3 className="text-lg font-bold text-emerald-900">
          {lang === "en" ? "Thank you!" : "Terima kasih!"}
        </h3>
        <p className="mt-2 text-sm text-emerald-800">
          {lang === "en"
            ? "Your inquiry has been received. We will contact you soon."
            : "Pengajuan Anda telah kami terima. Kami akan segera menghubungi Anda."}
        </p>
        <div className="mt-4">
          <Button
            href={waLink(getValues("phone") ?? "", waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
          >
            {lang === "en" ? "Continue via WhatsApp" : "Lanjut via WhatsApp"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      >
        <label htmlFor="inquiry-website">Website</label>
        <input
          id="inquiry-website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          {...register("website")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-parent-name" className={labelClasses}>
            {lang === "en" ? "Parent name *" : "Nama orang tua *"}
          </label>
          <input
            id="inquiry-parent-name"
            type="text"
            className={inputClasses}
            {...register("parent_name")}
          />
          {errors.parent_name ? (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.parent_name.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="inquiry-phone" className={labelClasses}>
            {lang === "en" ? "Phone *" : "No. HP *"}
          </label>
          <input
            id="inquiry-phone"
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            className={inputClasses}
            {...register("phone")}
          />
          {errors.phone ? (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="inquiry-whatsapp" className={labelClasses}>
            {lang === "en" ? "WhatsApp (optional)" : "WhatsApp (opsional)"}
          </label>
          <input
            id="inquiry-whatsapp"
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            className={inputClasses}
            {...register("whatsapp")}
          />
          {errors.whatsapp ? (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.whatsapp.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="inquiry-child-age" className={labelClasses}>
            {lang === "en" ? "Child age (optional)" : "Usia anak (opsional)"}
          </label>
          <input
            id="inquiry-child-age"
            type="text"
            placeholder={lang === "en" ? "e.g. 5 years" : "cth. 5 tahun"}
            className={inputClasses}
            {...register("child_age")}
          />
          {errors.child_age ? (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.child_age.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="inquiry-program" className={labelClasses}>
          {lang === "en" ? "Program of interest (optional)" : "Program yang diminati (opsional)"}
        </label>
        <select id="inquiry-program" className={inputClasses} {...register("program_class_id")}>
          <option value="">
            {lang === "en" ? "Select a program…" : "Pilih program…"}
          </option>
          {classes.map((classItem) => (
            <option key={classItem.code} value={classItem.id ?? classItem.code}>
              {classItem.name} ({classItem.ageMin}–{classItem.ageMax}{" "}
              {lang === "en" ? "yrs" : "th"})
            </option>
          ))}
        </select>
        {errors.program_class_id ? (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.program_class_id.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="inquiry-message" className={labelClasses}>
          {lang === "en" ? "Message (optional)" : "Pesan (opsional)"}
        </label>
        <textarea
          id="inquiry-message"
          rows={4}
          className={inputClasses}
          {...register("message")}
        />
        {errors.message ? (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600"
            {...register("consent_given")}
          />
          <span>
            {lang === "en" ? (
              <>
                I agree that my data will be processed per the{" "}
                <a
                  href={localizedHref(lang, privacyPolicyPath)}
                  className="font-medium text-emerald-700 underline"
                >
                  Privacy Policy
                </a>{" "}
                (version {privacyPolicyVersion}) *
              </>
            ) : (
              <>
                Saya menyetujui data saya diproses sesuai{" "}
                <a
                  href={localizedHref(lang, privacyPolicyPath)}
                  className="font-medium text-emerald-700 underline"
                >
                  Kebijakan Privasi
                </a>{" "}
                (versi {privacyPolicyVersion}) *
              </>
            )}
          </span>
        </label>
        {errors.consent_given ? (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.consent_given.message}
          </p>
        ) : null}
      </div>

      {serverError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={isSubmitting}>
        {lang === "en" ? "Submit Inquiry" : "Kirim Pengajuan"}
      </Button>
    </form>
  );
}
