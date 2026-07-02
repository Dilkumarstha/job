#!/usr/bin/env node
// scripts/dev.mjs
// Reads NEXTAUTH_URL from .env.local and starts Next.js on that port.

import { readFileSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

let port = 3000;

try {
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const match = line.match(/^\s*NEXTAUTH_URL\s*=\s*"?([^"#\s]+)"?/);
    if (match) {
      const url = new URL(match[1]);
      port = Number(url.port) || 3000;
      break;
    }
  }
} catch {
  // .env.local not found — fall back to 3000
}

console.log(`Starting Next.js on port ${port} (from NEXTAUTH_URL)`);
execSync(`next dev -p ${port}`, { stdio: "inherit" });
