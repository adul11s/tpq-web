let secret: string | undefined;
let backupCodes: string[] = [];

export function setAuthStore(s: { secret: string; backupCodes: string[] }): void {
  secret = s.secret;
  backupCodes = s.backupCodes;
}

export function getAuthStore(): { secret: string; backupCodes: string[] } {
  return { secret: secret ?? "", backupCodes };
}
