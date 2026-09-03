import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Production API origin for absolute media URLs (empty in local rewrite mode). */
const MEDIA_API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

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
 *
 * Strategy:
 * - Absolute http(s) pointing at local Django media → convert to `/media/...`
 *   so Next.js rewrite (next.config) proxies to the backend (avoids CORS / wrong host).
 * - Other absolute URLs left as-is.
 * - Relative paths normalized under `/media/` when missing the prefix.
 * - In production (NEXT_PUBLIC_API_URL set), relative media is prefixed with API host.
 */
export function resolveMediaUrl(src?: unknown): string | null {
  const raw = extractMediaPath(src);
  if (!raw) return null;
  if (raw === "[object Object]" || raw.includes("[object Object]")) return null;
  if (raw.length <= 2 || raw === "0" || raw.startsWith("0.")) return null;

  if (raw.startsWith("data:")) return raw;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const u = new URL(raw);
      // Local backend media → same-origin path for Next rewrite
      if (
        u.pathname.startsWith("/media/") &&
        (u.hostname === "127.0.0.1" ||
          u.hostname === "localhost" ||
          u.hostname === "0.0.0.0")
      ) {
        return u.pathname + u.search;
      }
      return raw;
    } catch {
      return raw;
    }
  }

  let path = raw.replace(/^\.\//, "");
  if (!path.startsWith("/")) path = `/${path}`;

  // Django FileField often returns path relative to MEDIA_ROOT without /media
  if (
    !path.startsWith("/media/") &&
    !path.startsWith("/_next/") &&
    !path.startsWith("/api/")
  ) {
    if (
      path.startsWith("/medals/") ||
      path.startsWith("/coins/") ||
      path.startsWith("/images/") ||
      path.startsWith("/uploads/")
    ) {
      path = `/media${path}`;
    } else if (!path.includes(".") && path.length < 8) {
      return null;
    }
  }

  // In production, point relative media at the API host
  if (
    MEDIA_API_BASE &&
    (path.startsWith("/media/") || path.startsWith("/api/"))
  ) {
    return `${MEDIA_API_BASE}${path}`;
  }

  return path;
}

/** Prefer primary_image_url then primary_image (string or nested). */
export function resolvePrimaryImage(item: {
  primary_image?: unknown;
  primary_image_url?: unknown;
}): string | null {
  return (
    resolveMediaUrl(item.primary_image_url) ||
    resolveMediaUrl(item.primary_image) ||
    null
  );
}
