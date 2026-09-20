"use client";

import { useCallback, useMemo, useState } from "react";
import type { ComboboxOption } from "@/components/ui/combobox";

const PREFIX = "ns-form-options:";

function readStored(key: string): ComboboxOption[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is ComboboxOption =>
          !!x &&
          typeof x === "object" &&
          typeof (x as ComboboxOption).value === "string" &&
          typeof (x as ComboboxOption).label === "string"
      )
      .map((x) => ({ value: x.value.trim(), label: x.label.trim() }))
      .filter((x) => x.value);
  } catch {
    return [];
  }
}

function writeStored(key: string, options: ComboboxOption[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(options));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Merge static option lists with user-created values persisted in localStorage.
 * Use the same storageKey across forms for shared lists (e.g. "country", "material").
 */
export function useCreatableOptions(
  baseOptions: readonly ComboboxOption[],
  storageKey: string
) {
  const [extra, setExtra] = useState<ComboboxOption[]>(() =>
    readStored(storageKey)
  );

  const options = useMemo(() => {
    const map = new Map<string, ComboboxOption>();
    for (const o of baseOptions) {
      if (o?.value != null && String(o.value).trim()) {
        map.set(String(o.value), {
          value: String(o.value),
          label: o.label || String(o.value),
        });
      }
    }
    for (const o of extra) {
      if (!map.has(o.value)) map.set(o.value, o);
    }
    return Array.from(map.values());
  }, [baseOptions, extra]);

  const addOption = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (!value) return value;
      setExtra((prev) => {
        if (
          prev.some((o) => o.value === value) ||
          baseOptions.some((o) => String(o.value) === value)
        ) {
          return prev;
        }
        const next = [...prev, { value, label: value }];
        writeStored(storageKey, next);
        return next;
      });
      return value;
    },
    [baseOptions, storageKey]
  );

  return { options, addOption };
}
