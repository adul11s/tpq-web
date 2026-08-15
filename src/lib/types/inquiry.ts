export type InquiryStatus =
  | "new"
  | "contacted"
  | "visited"
  | "enrolled"
  | "closed";

export interface InquiryRequest {
  parent_name: string;
  phone: string;
  whatsapp?: string;
  child_age?: string;
  program_class_id?: number;
  message?: string;
  consent_given: boolean;
  privacy_policy_version: string;
  website?: string;
}

export interface InquiryResponse {
  id: number;
  message: string;
}

export interface InquiryErrorBody {
  error: string;
  fields?: Record<string, string>;
}

export const PHONE_REGEX = /^(\+62|62|0)8[0-9]{7,11}$/;
