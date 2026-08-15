import type { Lang } from "@/lib/lang";

export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

interface DownloadEvent {
  event: "download_material";
  resource_id: number;
  resource_title: string;
  category: string;
  age_group: string;
  language: Lang;
}

interface InquirySubmittedEvent {
  event: "inquiry_submitted";
  language: Lang;
}

interface PageViewEvent {
  event: "page_view";
  language: Lang;
}

type TrackableEvent = DownloadEvent | InquirySubmittedEvent | PageViewEvent;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function push(event: TrackableEvent): void {
  if (typeof window === "undefined" || !window.dataLayer) {
    return;
  }
  window.dataLayer.push(event);
}

export function trackDownload(event: DownloadEvent): void {
  if (!GA4_MEASUREMENT_ID) {
    return;
  }
  push(event);
}

export function trackInquirySubmitted(event: InquirySubmittedEvent): void {
  if (!GA4_MEASUREMENT_ID) {
    return;
  }
  push(event);
}

export function trackPageView(event: PageViewEvent): void {
  if (!GA4_MEASUREMENT_ID) {
    return;
  }
  push(event);
}
