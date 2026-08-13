"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ColorMode = "light" | "dark" | "system";
export type FontScale = "sm" | "md" | "lg";
export type AccentPresetId =
  | "burgundy"
  | "slate"
  | "emerald"
  | "indigo"
  | "amber";

export interface AccentPreset {
  id: AccentPresetId;
  label: string;
  primary: string;
  deep: string;
  accent: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: "burgundy",
    label: "بورگاندی (پیش‌فرض)",
    primary: "#6E1F2A",
    deep: "#43131B",
    accent: "#9B3A49",
  },
  {
    id: "slate",
    label: "اسلیت",
    primary: "#334155",
    deep: "#1e293b",
    accent: "#64748b",
  },
  {
    id: "emerald",
    label: "زمردی",
    primary: "#047857",
    deep: "#064e3b",
    accent: "#10b981",
  },
  {
    id: "indigo",
    label: "نیلی",
    primary: "#4338ca",
    deep: "#312e81",
    accent: "#6366f1",
  },
  {
    id: "amber",
    label: "کهربایی",
    primary: "#b45309",
    deep: "#78350f",
    accent: "#d97706",
  },
];

const FONT_SCALE_MAP: Record<FontScale, string> = {
  sm: "14px",
  md: "16px",
  lg: "18px",
};

interface PreferencesState {
  accentId: AccentPresetId;
  fontScale: FontScale;
  colorMode: ColorMode;
  isHydrated: boolean;
  setAccentId: (id: AccentPresetId) => void;
  setFontScale: (scale: FontScale) => void;
  setColorMode: (mode: ColorMode) => void;
  setHydrated: (v: boolean) => void;
  applyToDocument: () => void;
}

function resolveDark(mode: ColorMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyPreferencesToDocument(
  accentId: AccentPresetId,
  fontScale: FontScale,
  colorMode: ColorMode
) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const preset =
    ACCENT_PRESETS.find((p) => p.id === accentId) ?? ACCENT_PRESETS[0];

  root.style.setProperty("--primary", preset.primary);
  root.style.setProperty("--primary-deep", preset.deep);
  root.style.setProperty("--primary-accent", preset.accent);
  root.style.fontSize = FONT_SCALE_MAP[fontScale];

  const dark = resolveDark(colorMode);
  root.classList.toggle("dark", dark);
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      accentId: "burgundy",
      fontScale: "md",
      colorMode: "light",
      isHydrated: false,

      setAccentId: (id) => {
        set({ accentId: id });
        const s = get();
        applyPreferencesToDocument(id, s.fontScale, s.colorMode);
      },

      setFontScale: (scale) => {
        set({ fontScale: scale });
        const s = get();
        applyPreferencesToDocument(s.accentId, scale, s.colorMode);
      },

      setColorMode: (mode) => {
        set({ colorMode: mode });
        const s = get();
        applyPreferencesToDocument(s.accentId, s.fontScale, mode);
      },

      setHydrated: (v) => set({ isHydrated: v }),

      applyToDocument: () => {
        const s = get();
        applyPreferencesToDocument(s.accentId, s.fontScale, s.colorMode);
      },
    }),
    {
      name: "medal-archive-preferences",
      partialize: (s) => ({
        accentId: s.accentId,
        fontScale: s.fontScale,
        colorMode: s.colorMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        state?.applyToDocument();
      },
    }
  )
);
