/**
 * Persian labels for coin / banknote choice fields.
 */

import {
  authenticityLabel,
  authenticityVariant,
  qualityLabel,
  authenticityFilterOptions,
} from "@/lib/medal-labels";

export { authenticityLabel, authenticityVariant, qualityLabel, authenticityFilterOptions };

const ITEM_TYPE: Record<string, string> = {
  coin: "سکه",
  banknote: "اسکناس",
  token: "توکن / ژتون",
  bullion: "شمش / فلز گران‌بها",
  other: "سایر",
};

export function coinItemTypeLabel(
  value: string | null | undefined,
  fallback = "—"
): string {
  if (!value) return fallback;
  const key = String(value).toLowerCase().trim();
  return ITEM_TYPE[key] ?? String(value);
}

export const coinItemTypeOptions = [
  { value: "coin", label: "سکه" },
  { value: "banknote", label: "اسکناس" },
  { value: "token", label: "توکن / ژتون" },
  { value: "bullion", label: "شمش / فلز گران‌بها" },
  { value: "other", label: "سایر" },
] as const;

export const coinImageTypeOptions = [
  { value: "front", label: "رو" },
  { value: "back", label: "پشت" },
  { value: "edge", label: "لبه" },
  { value: "detail", label: "جزئیات" },
  { value: "certificate", label: "گواهی" },
  { value: "other", label: "سایر" },
] as const;
