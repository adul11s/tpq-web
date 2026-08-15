export function redirectToLogin(reason?: string) {
  if (window.location.pathname.startsWith("/admin/login")) return;
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  window.location.replace(`/admin/login${query}`);
}
