export function waNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

export function waLink(phone: string, message?: string): string {
  const base = `https://wa.me/${waNumber(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
