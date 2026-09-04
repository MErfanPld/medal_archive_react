import { ApiError } from "./client";
import type { ApiErrorBody } from "@/types/api";

/** Map common DRF / English validation messages to Persian */
function translateMessage(text: string): string {
  const t = text.trim();
  if (/[\u0600-\u06FF]/.test(t)) return t;

  const rules: [RegExp, string][] = [
    [/this field is required\.?/i, "این فیلد الزامی است."],
    [/field is required/i, "این فیلد الزامی است."],
    [/may not be blank/i, "نمی‌تواند خالی باشد."],
    [/may not be null/i, "نمی‌تواند خالی باشد."],
    [/no file was submitted/i, "فایلی ارسال نشده است."],
    [/the submitted (data|file) was not a file/i, "فایل ارسال‌شده معتبر نیست."],
    [/upload a valid image/i, "لطفاً یک تصویر معتبر آپلود کنید."],
    [/file size/i, "حجم فایل بیش از حد مجاز است."],
    [/too large/i, "حجم فایل بیش از حد مجاز است."],
    [/unsupported/i, "فرمت فایل پشتیبانی نمی‌شود."],
    [/permission denied/i, "دسترسی غیرمجاز."],
    [/authentication credentials were not provided/i, "لطفاً وارد حساب کاربری شوید."],
    [/given token not valid/i, "نشست شما منقضی شده است. دوباره وارد شوید."],
    [/token is invalid or expired/i, "نشست شما منقضی شده است. دوباره وارد شوید."],
    [/not found/i, "مورد درخواستی یافت نشد."],
    [/already exists/i, "این مورد قبلاً ثبت شده است."],
    [/must be unique/i, "این مقدار تکراری است."],
    [/enter a valid/i, "مقدار واردشده معتبر نیست."],
    [/a valid number is required/i, "یک عدد معتبر وارد کنید."],
    [/ensure that there are no more than/i, "تعداد ارقام بیش از حد مجاز است."],
    [/date has wrong format/i, "فرمت تاریخ صحیح نیست."],
    [/datetime has wrong format/i, "فرمت تاریخ/زمان صحیح نیست."],
    [/not a valid/i, "مقدار نامعتبر است."],
    [/invalid/i, "مقدار نامعتبر است."],
    [/required/i, "این فیلد الزامی است."],
  ];

  for (const [re, fa] of rules) {
    if (re.test(t)) return fa;
  }
  return t;
}

const FIELD_LABELS: Record<string, string> = {
  username: "نام کاربری",
  password: "رمز عبور",
  email: "ایمیل",
  first_name: "نام",
  last_name: "نام خانوادگی",
  role_ids: "نقش‌ها",
  expires_in_hours: "اعتبار لینک",
  non_field_errors: "",
  name: "نام",
  title: "عنوان",
  description: "توضیحات",
  country: "کشور",
  year: "سال",
  category: "دسته‌بندی",
  category_id: "دسته‌بندی",
  image: "تصویر",
  images: "تصاویر",
  file: "فایل",
  files: "فایل‌ها",
  is_primary: "تصویر اصلی",
  image_type: "نوع تصویر",
  purchase_date: "تاریخ خرید",
  valuation_date: "تاریخ ارزش‌گذاری",
  seller: "فروشنده",
  location: "محل خرید",
  price: "قیمت",
  value: "ارزش",
  currency: "واحد پول",
  source: "منبع",
  notes: "یادداشت",
  material: "جنس",
  authenticity: "اصالت",
  condition: "وضعیت",
  weight: "وزن",
  diameter: "قطر",
  dimensions: "ابعاد",
};

export function formatApiErrorMessage(
  status: number,
  body: ApiErrorBody | null | undefined,
  fallback?: string
): string {
  if (body && typeof body === "object") {
    const detail = (body as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) {
      return translateMessage(detail);
    }
    if (Array.isArray(detail) && detail.length) {
      return detail.map((d) => translateMessage(String(d))).join(" ");
    }

    const parts: string[] = [];
    for (const [key, val] of Object.entries(body)) {
      if (key === "detail") continue;
      const label = FIELD_LABELS[key] ?? key;
      let text = "";
      if (Array.isArray(val)) {
        text = val.map((v) => translateMessage(String(v))).join(" ");
      } else if (typeof val === "string") {
        text = translateMessage(val);
      } else if (val != null && typeof val === "object") {
        text = translateMessage(JSON.stringify(val));
      } else if (val != null) {
        text = translateMessage(String(val));
      }
      if (!text) continue;
      if (
        key === "username" &&
        /already|exists|taken|استفاده شده|موجود/i.test(text)
      ) {
        text =
          "این نام کاربری قبلاً ثبت شده است. برای دعوت، نام کاربری جدید انتخاب کنید.";
      }
      parts.push(label ? `${label}: ${text}` : text);
    }
    if (parts.length) return parts.join(" — ");
  }

  if (fallback) return fallback;

  switch (status) {
    case 0:
      return "خطا در ارتباط با سرور. اتصال اینترنت و آدرس API را بررسی کنید.";
    case 400:
      return "اطلاعات واردشده صحیح نیست. فیلد‌ها را بررسی کنید.";
    case 401:
      return "نشست شما منقضی شده یا احراز هویت نشده‌اید. دوباره وارد شوید.";
    case 403:
      return "شما اجازه انجام این عملیات را ندارید.";
    case 404:
      return "مورد درخواستی یافت نشد.";
    case 413:
      return "حجم فایل بیش از حد مجاز سرور است.";
    case 415:
      return "نوع فایل پشتیبانی نمی‌شود.";
    case 429:
      return "تعداد درخواست‌ها بیش از حد است. کمی بعد تلاش کنید.";
    case 500:
    case 502:
    case 503:
      return "خطای داخلی سرور. لطفاً چند لحظه بعد دوباره تلاش کنید.";
    default:
      return `خطای سرور (${status})`;
  }
}

export function getErrorMessage(err: unknown, fallback?: string): string {
  if (err instanceof ApiError) {
    if (err.body && typeof err.body === "object") {
      return formatApiErrorMessage(err.status, err.body, fallback);
    }
    if (err.message && /[\u0600-\u06FF]/.test(err.message)) {
      return err.message;
    }
    if (err.message) {
      const translated = translateMessage(err.message);
      if (translated !== err.message) return translated;
    }
    return formatApiErrorMessage(err.status, err.body, fallback);
  }
  if (err instanceof Error && err.message) {
    return translateMessage(err.message);
  }
  return fallback || "خطای غیرمنتظره رخ داد.";
}
