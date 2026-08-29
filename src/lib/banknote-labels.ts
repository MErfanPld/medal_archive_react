/**
 * Persian labels for banknote (اسکناس) domain.
 */

import {
  authenticityLabel,
  authenticityVariant,
  authenticityFilterOptions,
  qualityLabel,
} from "@/lib/coin-labels";

export {
  authenticityLabel,
  authenticityVariant,
  authenticityFilterOptions,
  qualityLabel,
};

export const banknoteImageTypeOptions = [
  { value: "front", label: "رو" },
  { value: "back", label: "پشت" },
  { value: "detail", label: "جزئیات" },
  { value: "certificate", label: "گواهی" },
  { value: "other", label: "سایر" },
] as const;
