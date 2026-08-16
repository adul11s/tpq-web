import { readFileSync, writeFileSync } from "node:fs";

const FILE = "test-results/.e2e-auth-store.json";

let secret: string | undefined;
let backupCodes: string[] = [];

function loadFromFile(): void {
  if (secret || backupCodes.length > 0) return;
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as { secret?: string; backupCodes?: string[] };
    secret = raw.secret;
    backupCodes = raw.backupCodes ?? [];
  } catch {
    // no persisted store yet
  }
}

export function setAuthStore(s: { secret: string; backupCodes: string[] }): void {
  secret = s.secret;
  backupCodes = s.backupCodes;
  try {
    writeFileSync(FILE, JSON.stringify(s), "utf8");
  } catch {
    // best-effort persistence; in-memory still works within a worker
  }
}

export function getAuthStore(): { secret: string; backupCodes: string[] } {
  loadFromFile();
  return { secret: secret ?? "", backupCodes };
}
