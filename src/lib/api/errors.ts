import { ApiError } from "./client";
import type { ApiErrorBody } from "@/types/api";

/**
 * Extract a human-readable message from Django REST Framework error bodies.
 * Prefers backend text over generic fallbacks.
 */
export function formatApiErrorMessage(
  status: number,
  body: ApiErrorBody | null | undefined,
  fallback?: string
): string {
  if (body && typeof body === "object") {
    const detail = body.detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail) && detail.length) {
      return detail.map(String).join(" ");
    }

    const parts: string[] = [];
    for (const [key, val] of Object.entries(body)) {
      if (key === "detail") continue;
      if (Array.isArray(val)) {
        parts.push(val.map(String).join(" "));
      } else if (typeof val === "string") {
        parts.push(val);
      }
    }
    if (parts.length) return parts.join(" ");
  }

  if (fallback) return fallback;

  switch (status) {
    case 0:
      return "خطا در ارتباط با سرور. اتصال و آدرس API را بررسی کنید.";
    case 400:
      return "اطلاعات واردشده صحیح نیست.";
    case 401:
      return "نام کاربری یا رمز عبور اشتباه است.";
    case 403:
      return "دسترسی غیرمجاز.";
    case 404:
      return "منبع یافت نشد.";
    case 429:
      return "تعداد درخواست‌ها بیش از حد است. کمی بعد تلاش کنید.";
    case 500:
    case 502:
    case 503:
      return "خطای داخلی سرور. لطفاً بعداً تلاش کنید.";
    default:
      return `خطای سرور (${status})`;
  }
}

export function getErrorMessage(err: unknown, fallback?: string): string {
  if (err instanceof ApiError) {
    return formatApiErrorMessage(err.status, err.body, err.message || fallback);
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback || "خطای غیرمنتظره رخ داد.";
}
