"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/lib/gtag";
import type { Lang } from "@/lib/lang";

interface AnalyticsTrackerProps {
  lang: Lang;
}

export function AnalyticsTracker({ lang }: AnalyticsTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView({ event: "page_view", language: lang });
  }, [pathname, lang]);

  return null;
}
