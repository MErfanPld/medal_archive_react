import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely (cn utility).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number for Persian locale (with commas / tabular).
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("fa-IR").format(num);
}

/**
 * Simple Persian date formatter (YYYY/MM/DD style from ISO).
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

/**
 * Extract a usable media path from API fields that may be string or nested object.
 */
function extractMediaPath(src: unknown): string | null {
  if (src == null) return null;
  if (typeof src === "string") {
    const s = src.trim();
    return s || null;
  }
  if (typeof src === "object") {
    const o = src as Record<string, unknown>;
    for (const key of [
      "image_url",
      "file_url",
      "url",
      "image",
      "file",
      "src",
      "path",
    ]) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return null;
}

/**
 * Resolve media URL from API (relative `/media/...` or absolute).
 * Accepts string or nested media object. Returns null for empty / invalid.
 * Relative `/media/...` stays same-origin so Next rewrites to Django.
 */
export function resolveMediaUrl(src?: unknown): string | null {
  const raw = extractMediaPath(src);
  if (!raw) return null;
  // Never allow [object Object] to leak into <img src>
  if (raw === "[object Object]" || raw.includes("[object Object]")) return null;
  if (raw.length <= 2 || raw === "0" || raw.startsWith("0.")) return null;
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }
  if (raw.startsWith("/")) return raw;
  if (raw.startsWith("media/")) return `/${raw}`;
  return `/${raw.replace(/^\.\//, "")}`;
}
