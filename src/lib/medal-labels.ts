/**
 * Persian labels for medal enum / choice fields.
 * Lookup is case-insensitive and tolerates whitespace.
 */

const AUTHENTICITY: Record<string, string> = {
  authentic: "اصیل",
  suspect: "مشکوک",
  counterfeit: "جعلی",
  fake: "جعلی",
  unverified: "تأییدنشده",
  unknown: "نامشخص",
  pending: "در انتظار بررسی",
};

const QUALITY: Record<string, string> = {
  UNC: "بدون گردش (UNC)",
  AU: "تقریباً بدون گردش (AU)",
  XF: "بسیار عالی (XF)",
  VF: "خیلی خوب (VF)",
  F: "خوب (F)",
  VG: "نسبتاً خوب (VG)",
  G: "متوسط (G)",
  AG: "تقریباً متوسط (AG)",
  FAIR: "ضعیف",
  POOR: "بسیار ضعیف",
  OTHER: "سایر",
};

const AUTH_VARIANT: Record<
  string,
  "success" | "warning" | "danger" | "default" | "primary"
> = {
  authentic: "success",
  suspect: "warning",
  counterfeit: "danger",
  fake: "danger",
  unverified: "default",
  unknown: "default",
  pending: "warning",
};

function lookup(
  map: Record<string, string>,
  value: string | null | undefined
): string | null {
  if (value == null || String(value).trim() === "") return null;
  const raw = String(value).trim();
  if (map[raw]) return map[raw];
  const key = Object.keys(map).find((k) => k.toLowerCase() === raw.toLowerCase());
  return key ? map[key] : null;
}

export function authenticityLabel(
  value: string | null | undefined,
  fallback = "—"
): string {
  return lookup(AUTHENTICITY, value) ?? (value ? String(value) : fallback);
}

export function authenticityVariant(
  value: string | null | undefined
): "success" | "warning" | "danger" | "default" | "primary" {
  const k = String(value ?? "").trim().toLowerCase();
  return AUTH_VARIANT[k] ?? "default";
}

export function qualityLabel(
  value: string | null | undefined,
  fallback = "—"
): string {
  if (value == null || String(value).trim() === "") return fallback;
  const raw = String(value).trim();
  if (QUALITY[raw]) return QUALITY[raw];
  const key = Object.keys(QUALITY).find(
    (k) => k.toLowerCase() === raw.toLowerCase()
  );
  return key ? QUALITY[key] : raw;
}

export const authenticityFilterOptions = Object.entries(AUTHENTICITY).map(
  ([value, label]) => ({ value, label })
);
