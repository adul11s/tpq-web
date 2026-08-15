export function isPlaceholderThumb(
  url: string | null | undefined,
): boolean {
  return typeof url === "string" && url.startsWith("/placeholders/");
}
