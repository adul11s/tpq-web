export function redirectToLogin(reason?: string) {
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  window.location.href = `/admin/login${query}`;
}
