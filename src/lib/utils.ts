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
 * Resolve media URL from API (relative `/media/...` or absolute).
 * Returns null when value is empty / placeholder-like.
 */
export function resolveMediaUrl(
  src?: string | null
): string | null {
  if (!src) return null;
  const s = String(src).trim();
  if (!s || s.length <= 2 || s === "0" || s.startsWith("0.")) return null;
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) {
    return s;
  }
  if (s.startsWith("/")) return s;
  return `/${s.replace(/^\.\//, "")}`;
}
