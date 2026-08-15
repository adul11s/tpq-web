"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const CHILD_AGES = Array.from({ length: 10 }, (_, index) => `${index + 3} tahun`);

const inquirySchema = z.object({
  parent_name: z
    .string()
    .min(2, "Nama harus 2–150 karakter")
    .max(150, "Nama harus 2–150 karakter"),
  phone: z.string().regex(PHONE_REGEX, "Nomor HP tidak valid"),
  child_age: z.string().min(1, "Pilih usia ananda"),
  program_class_id: z.string().min(1, "Pilih program yang diminati"),
  message: z
    .string()
    .min(10, "Pertanyaan minimal 10 karakter")
    .max(2000, "Maksimal 2000 karakter"),
  consent_given: z.boolean().refine((value) => value === true, {
    message: "Anda harus menyetujui Kebijakan Privasi",
  }),
  website: z.string().optional(),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

const inputClasses =
  "w-full rounded-2xl border border-mint-200 bg-white px-4 py-3 text-sm text-mint-900 placeholder:text-mint-800/40 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-500/30";
const labelClasses = "block text-sm font-bold text-mint-900";
const errorClasses = "mt-1 text-xs font-semibold text-rose-600";

const FIELD_ORDER: (keyof InquiryFormValues)[] = [
  "parent_name",
  "phone",
  "child_age",
  "program_class_id",
  "message",
  "consent_given",
];

export function InquiryForm({
  lang,
  classes,
  privacyPolicyVersion,
  privacyPolicyPath,
}: InquiryFormProps) {
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [consentNotice, setConsentNotice] = useState(false);
  const mountedRef = useRef(false);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      parent_name: "",
      phone: "",
      child_age: "",
      program_class_id: "",
      message: "",
      consent_given: false,
      website: "",
    },
  });

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setValue("consent_given", false);
    setConsentNotice(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privacyPolicyVersion]);

  async function onSubmit(values: InquiryFormValues) {
    setServerError(null);
    const isHoneypot = Boolean(values.website);

    try {
      const response = await submitInquiry({
        parent_name: values.parent_name.trim(),
        phone: values.phone.trim(),
        child_age: values.child_age.trim(),
        program_class_id: Number(values.program_class_id),
        message: values.message.trim(),
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
        const firstServerField = Object.keys(apiError.fields).find(
          (field) => (FIELD_ORDER as string[]).includes(field),
        );
        if (firstServerField) {
          setFocus(firstServerField as keyof InquiryFormValues);
        }
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

  function onInvalid() {
    for (const field of FIELD_ORDER) {
      if (errors[field]) {
        setFocus(field);
        break;
      }
    }
  }

  if (submittedId !== null) {
    const program = classes.find(
      (classItem) =>
        classItem.id === Number(getValues("program_class_id")),
    );
    const details = [
      getValues("child_age") ? `usia anak: ${getValues("child_age")}` : null,
      program ? `program: ${program.name}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    const waMessage = `Assalamu'alaikum, saya ${getValues("parent_name") ?? ""}${
      details ? ` (${details})` : ""
    }.${getValues("message") ? `\n\n${getValues("message")}` : ""}`;

    return (
      <div className="rounded-3xl border border-mint-100 bg-mint-50 p-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary">
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="mt-4 font-display text-xl font-extrabold text-mint-900">
          {lang === "en" ? "Thank you!" : "Terima kasih!"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-mint-800/80">
          {lang === "en"
            ? "Your inquiry has been received. Our team will contact you within 24 hours. Want to chat sooner?"
            : "Pertanyaan Anda sudah kami terima. Tim TPQ Qur'ani akan menghubungi Anda maksimal 24 jam. Ingin lebih cepat?"}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={waLink(getValues("phone") ?? "", waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-extrabold text-on-primary shadow-md shadow-primary/20 transition-colors hover:bg-primary-hover"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-1.5-.5 12 12 0 0 1-4.4-3.9 5 5 0 0 1-1-2.7c0-1.2.6-1.8 1-2.2l.5-.5c.2-.2.4-.2.6-.2h.4c.2 0 .4-.1.6.4l.8 1.9c.1.2.1.4 0 .6l-.3.5-.5.5c-.2.2-.3.4-.2.7.2.3.8 1.3 1.6 2.1 1.1 1 2 1.4 2.4 1.5.3.2.5.1.7-.1l1-1.2c.2-.3.4-.3.7-.2l2 1c.3.1.5.2.5.4.1.3.1.8-.2 1.3Z" />
            </svg>
            {lang === "en" ? "Continue via WhatsApp" : "Lanjut via WhatsApp"}
          </a>
          <button
            type="button"
            onClick={() => {
              setSubmittedId(null);
              setServerError(null);
              reset();
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-mint-300 bg-white px-7 py-3 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50"
          >
            {lang === "en" ? "Send another question" : "Kirim pertanyaan lain"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5" noValidate>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="inquiry-website">Website</label>
        <input
          id="inquiry-website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          {...register("website")}
        />
      </div>

      <div>
        <label htmlFor="inquiry-parent-name" className={labelClasses}>
          {lang === "en" ? "Parent name *" : "Nama Ayah/Bunda *"}
        </label>
        <input
          id="inquiry-parent-name"
          type="text"
          autoComplete="name"
          className={`mt-1.5 ${inputClasses}`}
          {...register("parent_name")}
        />
        {errors.parent_name ? (
          <p className={errorClasses} role="alert">
            {errors.parent_name.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="inquiry-phone" className={labelClasses}>
          {lang === "en" ? "WhatsApp number *" : "Nomor WhatsApp *"}
        </label>
        <input
          id="inquiry-phone"
          type="tel"
          autoComplete="tel"
          placeholder="08xx-xxxx-xxxx"
          className={`mt-1.5 ${inputClasses}`}
          {...register("phone")}
        />
        {errors.phone ? (
          <p className={errorClasses} role="alert">
            {errors.phone.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-child-age" className={labelClasses}>
            {lang === "en" ? "Child's age *" : "Usia Ananda *"}
          </label>
          <select
            id="inquiry-child-age"
            className={`mt-1.5 ${inputClasses}`}
            {...register("child_age")}
          >
            <option value="">
              {lang === "en" ? "Select age…" : "Pilih usia…"}
            </option>
            {CHILD_AGES.map((age) => (
              <option key={age} value={age}>
                {lang === "en" ? age.replace(" tahun", " years") : age}
              </option>
            ))}
          </select>
          {errors.child_age ? (
            <p className={errorClasses} role="alert">
              {errors.child_age.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="inquiry-program" className={labelClasses}>
            {lang === "en" ? "Program of interest *" : "Program yang Diminati *"}
          </label>
          <select
            id="inquiry-program"
            className={`mt-1.5 ${inputClasses}`}
            {...register("program_class_id")}
          >
            <option value="">
              {lang === "en" ? "Select a program…" : "Pilih program…"}
            </option>
            {classes.map((classItem) => (
              <option
                key={classItem.code}
                value={classItem.id ?? classItem.code}
              >
                {classItem.name} ({classItem.ageMin}–{classItem.ageMax}{" "}
                {lang === "en" ? "yrs" : "th"})
              </option>
            ))}
          </select>
          {errors.program_class_id ? (
            <p className={errorClasses} role="alert">
              {errors.program_class_id.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="inquiry-message" className={labelClasses}>
          {lang === "en" ? "Question *" : "Pertanyaan *"}
        </label>
        <textarea
          id="inquiry-message"
          rows={5}
          placeholder={
            lang === "en"
              ? "e.g. What programs are available for a 5-year-old?"
              : "cth. Program apa saja yang tersedia untuk anak usia 5 tahun?"
          }
          className={`mt-1.5 ${inputClasses}`}
          {...register("message")}
        />
        {errors.message ? (
          <p className={errorClasses} role="alert">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-mint-900/80">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 rounded accent-primary"
            {...register("consent_given")}
          />
          <span className="leading-relaxed">
            {lang === "en" ? (
              <>
                I agree that my data will be processed according to the{" "}
                <a
                  href={localizedHref(lang, privacyPolicyPath)}
                  className="font-bold text-primary underline underline-offset-2 hover:text-primary-hover"
                >
                  TPQ Qur&rsquo;ani Privacy Policy
                </a>{" "}
                . *
              </>
            ) : (
              <>
                Saya setuju data saya diproses sesuai{" "}
                <a
                  href={localizedHref(lang, privacyPolicyPath)}
                  className="font-bold text-primary underline underline-offset-2 hover:text-primary-hover"
                >
                  Kebijakan Privasi
                </a>{" "}
                TPQ Qur&rsquo;ani. *
              </>
            )}
          </span>
        </label>
        {consentNotice ? (
          <p className="mt-2 rounded-xl border border-gold-200 bg-gold-50 px-3 py-2 text-xs font-bold text-gold-700" role="status">
            {lang === "en"
              ? "The privacy policy has been updated. Please re-check the consent box above."
              : "Kebijakan Privasi telah diperbarui. Mohon centang kembali persetujuan di atas."}
          </p>
        ) : null}
        {errors.consent_given ? (
          <p className={errorClasses} role="alert">
            {errors.consent_given.message}
          </p>
        ) : null}
      </div>

      {serverError ? (
        <p
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-extrabold text-on-primary shadow-md shadow-primary/20 transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting
            ? lang === "en"
              ? "Sending…"
              : "Mengirim…"
            : lang === "en"
              ? "Send Question"
              : "Kirim Pertanyaan"}
        </button>
        <p className="text-xs font-bold text-mint-800/50">
          {lang === "en"
            ? "We reply within 24 hours at the latest."
            : "Kami membalas dalam maksimal 24 jam."}
        </p>
      </div>
    </form>
  );
}
