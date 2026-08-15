export type Lang = "id" | "en";

export const DEFAULT_LANG: Lang = "id";

export function isLang(value: string | undefined): value is Lang {
  return value === "id" || value === "en";
}

export function localizedHref(lang: Lang, path: string): string {
  if (lang === "en") {
    return `/en${path.startsWith("/") ? path : `/${path}`}`;
  }
  return path;
}

export function pick(
  lang: Lang,
  id: string | null | undefined,
  en: string | null | undefined,
): string {
  if (lang === "en" && en) {
    return en;
  }
  return id ?? "";
}

export function localizedAlternateHref(
  lang: Lang,
  path: string,
): string {
  if (lang === "en") {
    return path.replace(/^\/en(?=\/|$)/, "") || "/";
  }
  return path;
}
