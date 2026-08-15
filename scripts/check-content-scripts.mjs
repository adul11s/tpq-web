// Content script policy check (release checklist 1.12):
// static HTML in public/content/ must be script-free (no <script>,
// no inline event handlers, no javascript: URLs). Fails with a list of
// offending files so a contributor can strip scripts before committing.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "public", "content");
const SCRIPT_PATTERNS = [
  /<script[\s>]/i,
  /\son\w+\s*=/i,
  /\sjavascript:/i,
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, files);
    } else if (full.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(ROOT);
const offenders = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const pattern of SCRIPT_PATTERNS) {
    if (pattern.test(source)) {
      offenders.push(`${file} (${pattern})`);
      break;
    }
  }
}

if (offenders.length > 0) {
  console.error("Content script policy violation — scripts are not allowed in public/content/:");
  for (const offender of offenders) {
    console.error(`  - ${offender}`);
  }
  process.exit(1);
}

console.log(`check:content OK — ${files.length} static HTML files, script-free.`);
