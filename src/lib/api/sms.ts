import { adminFetch } from "@/lib/api/admin-client";

export type HafalanLevel = "paud" | "tk" | "tpa";
export type HafalanStatus = "belum" | "sedang" | "tuntas";
export type FluencyLevel = "lancar" | "kurang_lancar";
export type AttendanceStatus = "hadir" | "izin" | "sakit" | "alpha";
export type Semester = "ganjil" | "genap";
export type RaporPeriodStatus = "open" | "locked";
export type EnrollmentStatus = "active" | "graduated" | "transferred";

export interface SmsStudent {
  id: number;
  nis: string | null;
  full_name: string;
  birth_date: string | null;
  gender: string | null;
  class: string | null;
}

export interface Guardianship {
  id: number;
  user_id: number;
  parent_email: string;
  student_id: number;
  student_name: string;
  relation: string | null;
}

export interface AcademicYear {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Enrollment {
  id: number;
  student_id: number;
  student_name: string;
  class_id: number;
  class_code: string;
  academic_year_id: number;
  status: EnrollmentStatus;
}

export interface HafalanTarget {
  id: number;
  level: HafalanLevel;
  surah_name: string;
  sort_order: number;
}

export interface HafalanRecord {
  id: number;
  student_id: number;
  student_name: string;
  surah_name: string;
  status: HafalanStatus;
  fluency: FluencyLevel | null;
  updated_by: number;
  updated_at: string;
}

export interface AttendanceRow {
  enrollment_id: number;
  student_name: string;
  date: string | null;
  status: AttendanceStatus | null;
  note: string | null;
}

export interface AdabCriterion {
  id: number;
  name: string;
  sort_order: number;
}

export interface AdabRating {
  id: number;
  student_id: number;
  criterion_id: number;
  rapor_period_id: number;
  scale: number;
  created_at: string;
  updated_at: string;
}

export interface RaporPeriod {
  id: number;
  academic_year_id: number;
  academic_year: string;
  semester: Semester;
  status: RaporPeriodStatus;
}

export interface RaporDocument {
  id: number;
  student_id: number;
  student_name: string;
  rapor_period_id: number;
  semester: Semester;
  storage_key: string;
  file_size: number;
  finalized_at: string | null;
}

export interface StudentInput {
  nis?: string | null;
  full_name: string;
  birth_date?: string | null;
  gender?: string | null;
}

export interface GuardianshipInput {
  user_id: number;
  student_id: number;
  relation?: string;
}

export interface AcademicYearInput {
  name: string;
  start_month?: number;
  is_active?: boolean;
}

export interface EnrollmentInput {
  student_id: number;
  class_id: number;
  academic_year_id: number;
  status?: EnrollmentStatus;
}

export interface HafalanInput {
  student_id: number;
  surah_name: string;
  status: HafalanStatus;
  fluency?: FluencyLevel | null;
}

export interface AttendanceInput {
  class_id: number;
  date: string;
  records: Array<{
    enrollment_id: number;
    status: AttendanceStatus;
    note?: string;
  }>;
}

export interface GenerateRaporInput {
  student_id: number;
  rapor_period_id: number;
  attendance_override?: {
    hadir?: number;
    izin?: number;
    sakit?: number;
    alpha?: number;
  };
  teacher_comment?: string;
  school_name?: string;
}

export interface ProvisionParentInput {
  email: string;
  full_name: string;
  initial_password: string;
}

export interface ProvisionedParent {
  id: number;
  email: string;
  initial_password: string;
  must_change_password: boolean;
}

export interface HafalanUpsertResult {
  id: number;
  student_id: number;
  surah_name: string;
  status: HafalanStatus;
  fluency: FluencyLevel | null;
}

export interface RaporGenerateResult {
  id: number;
  storage_key: string;
  file_size: number;
}

export const smsApi = {
  listStudents: (): Promise<{ students: SmsStudent[] }> =>
    adminFetch<{ students: SmsStudent[] }>("/admin/students"),

  createStudent: (input: StudentInput): Promise<{ id: number; full_name: string }> =>
    adminFetch<{ id: number; full_name: string }>("/admin/students", {
      method: "POST",
      body: input,
    }),

  updateStudent: (id: number, input: Partial<StudentInput>): Promise<{ id: number; full_name: string }> =>
    adminFetch<{ id: number; full_name: string }>(`/admin/students/${id}`, {
      method: "PATCH",
      body: input,
    }),

  deleteStudent: (id: number): Promise<{ ok: true }> =>
    adminFetch<{ ok: true }>(`/admin/students/${id}`, { method: "DELETE" }),

  listGuardianships: (): Promise<{ guardianships: Guardianship[] }> =>
    adminFetch<{ guardianships: Guardianship[] }>("/admin/guardianships"),

  createGuardianship: (input: GuardianshipInput): Promise<{ id: number }> =>
    adminFetch<{ id: number }>("/admin/guardianships", {
      method: "POST",
      body: input,
    }),

  deleteGuardianship: (id: number): Promise<{ ok: true }> =>
    adminFetch<{ ok: true }>(`/admin/guardianships/${id}`, { method: "DELETE" }),

  listAcademicYears: (): Promise<{ academic_years: AcademicYear[] }> =>
    adminFetch<{ academic_years: AcademicYear[] }>("/admin/academic-years"),

  createAcademicYear: (input: AcademicYearInput): Promise<{ id: number; name: string }> =>
    adminFetch<{ id: number; name: string }>("/admin/academic-years", {
      method: "POST",
      body: input,
    }),

  listEnrollments: (): Promise<{ enrollments: Enrollment[] }> =>
    adminFetch<{ enrollments: Enrollment[] }>("/admin/enrollments"),

  createEnrollment: (input: EnrollmentInput): Promise<{ id: number }> =>
    adminFetch<{ id: number }>("/admin/enrollments", {
      method: "POST",
      body: input,
    }),

  deleteEnrollment: (id: number): Promise<{ ok: true }> =>
    adminFetch<{ ok: true }>(`/admin/enrollments/${id}`, { method: "DELETE" }),

  listHafalanTargets: (level?: HafalanLevel): Promise<{ targets: HafalanTarget[] }> =>
    adminFetch<{ targets: HafalanTarget[] }>(`/admin/hafalan-targets${level ? `?level=${level}` : ""}`),

  listHafalan: (studentId?: number): Promise<{ records: HafalanRecord[] }> =>
    adminFetch<{ records: HafalanRecord[] }>(`/admin/hafalan${studentId ? `?student_id=${studentId}` : ""}`),

  upsertHafalan: (input: HafalanInput): Promise<HafalanUpsertResult> =>
    adminFetch<HafalanUpsertResult>("/admin/hafalan", {
      method: "PUT",
      body: input,
    }),

  listAttendance: (opts?: { class_id?: number; date?: string }): Promise<{ attendance: AttendanceRow[] }> => {
    const params = new URLSearchParams();
    if (opts?.class_id !== undefined) params.set("class_id", String(opts.class_id));
    if (opts?.date !== undefined) params.set("date", opts.date);
    const query = params.toString();
    return adminFetch<{ attendance: AttendanceRow[] }>(`/admin/attendance${query ? `?${query}` : ""}`);
  },

  postAttendance: (input: AttendanceInput): Promise<{ ok: true; saved: number }> =>
    adminFetch<{ ok: true; saved: number }>("/admin/attendance", {
      method: "POST",
      body: input,
    }),

  listAdabCriteria: (): Promise<{ criteria: AdabCriterion[] }> =>
    adminFetch<{ criteria: AdabCriterion[] }>("/admin/adab-criteria"),

  listAdabRatings: (): Promise<{ ratings: AdabRating[] }> =>
    adminFetch<{ ratings: AdabRating[] }>("/admin/adab-ratings"),

  listRaporPeriods: (): Promise<{ periods: RaporPeriod[] }> =>
    adminFetch<{ periods: RaporPeriod[] }>("/admin/rapor-periods"),

  lockPeriod: (id: number): Promise<{ id: number; status: RaporPeriodStatus }> =>
    adminFetch<{ id: number; status: RaporPeriodStatus }>(`/admin/rapor-periods/${id}/lock`, {
      method: "POST",
    }),

  unlockPeriod: (id: number): Promise<{ id: number; status: RaporPeriodStatus }> =>
    adminFetch<{ id: number; status: RaporPeriodStatus }>(`/admin/rapor-periods/${id}/unlock`, {
      method: "POST",
    }),

  generateRapor: (input: GenerateRaporInput): Promise<RaporGenerateResult> =>
    adminFetch<RaporGenerateResult>("/admin/rapor/generate", {
      method: "POST",
      body: input,
    }),

  listRaporDocuments: (): Promise<{ documents: RaporDocument[] }> =>
    adminFetch<{ documents: RaporDocument[] }>("/admin/rapor/documents"),

  provisionParent: (input: ProvisionParentInput): Promise<ProvisionedParent> =>
    adminFetch<ProvisionedParent>("/admin/users/parents", {
      method: "POST",
      body: input,
    }),

  resetParentPassword: (id: number, newPassword: string): Promise<{ ok: true; must_change_password: boolean }> =>
    adminFetch<{ ok: true; must_change_password: boolean }>(`/admin/users/${id}/reset-password`, {
      method: "POST",
      body: { new_password: newPassword },
    }),
};
