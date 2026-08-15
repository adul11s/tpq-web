"use client";

import { useEffect, useState } from "react";

export function useQueryParams(): URLSearchParams {
  const [params, setParams] = useState(
    () =>
      typeof window === "undefined"
        ? new URLSearchParams()
        : new URLSearchParams(window.location.search),
  );

  useEffect(() => {
    const sync = () => setParams(new URLSearchParams(window.location.search));
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return params;
}
