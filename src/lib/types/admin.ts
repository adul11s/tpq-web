export type ContentStatus = "draft" | "published" | "archived";
export type Role = "admin" | "content_manager" | "parent" | "teacher";
export type AgeGroup = "paud" | "tk" | "tpa" | "all";
export type InquiryStatus = "new" | "contacted" | "visited" | "enrolled" | "closed";

export interface AdminList<T> { [entity: string]: T[] }   // content list: { [entity]: rows }
export interface AdminClass { id: number; code: string; name: string; name_en: string | null; age_min: number; age_max: number; description: string | null; description_en: string | null; hours: string | null; fees: string | null; capacity: string | null; status: ContentStatus; created_at: string; updated_at: string; }
export interface AdminResource { id: number; title: string; slug: string; category_id: number; age_group: AgeGroup; description: string | null; file_media_id: number; thumbnail_media_id: number; status: ContentStatus; download_count: number; published_at: string | null; }
export interface AdminMediaAsset { id: number; original_name: string; storage_key: string; mime_type: string; file_size: number; kind: "pdf" | "image" | "audio"; created_at: string; }
export interface AdminInquiry { id: number; parent_name: string | null; phone: string | null; whatsapp: string | null; child_age: string | null; program_class_id: number | null; message: string | null; status: InquiryStatus; admin_note: string | null; handled_by: number | null; created_at: string; }
export interface AdminAuditRow { id: number; user_id: number; action: string; entity_type: string | null; entity_id: number | null; ip: string | null; user_agent: string | null; created_at: string; }
export interface AdminUser { id: number; email: string; full_name: string; role: "admin" | "content_manager"; is_active: boolean; has_2fa: boolean; }

export interface AdminMe { id: number; email: string; full_name: string; role: Role; has_2fa: boolean; }
export interface AdminPage { id: number; slug: string; title_id: string; title_en: string | null; status: ContentStatus; published_at: string | null; updated_at: string | null; }
export interface AdminPrayerGuide { id: number; occasion: string; occasion_slug: string; arabic_text: string; transliteration: string; meaning_id: string; meaning_en: string | null; sort_order: number; }
export interface AdminTeacher { id: number; name: string; photo_media_id: number | null; bio: string | null; sort_order: number; }
export interface AdminTestimonial { id: number; author_name: string; quote: string; photo_media_id: number | null; status: ContentStatus; sort_order: number; }
export interface AdminFaq { id: number; question: string; answer: string; sort_order: number; status: ContentStatus; }
export interface AdminCategory { id: number; name: string; slug: string; description: string | null; }
