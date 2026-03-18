import type { PackageManager } from "./types";

export function detectPackageManager(): PackageManager {
  const ua = process.env.npm_config_user_agent;
  if (ua) {
    if (ua.startsWith("bun")) return "bun";
    if (ua.startsWith("pnpm")) return "pnpm";
  }
  return "npm";
}
