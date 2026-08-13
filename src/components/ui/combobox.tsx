"use client";

import * as React from "react";
import { ChevronsUpDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
};

export interface ComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  allowCustom?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  name?: string;
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      id,
      options,
      value = "",
      onChange,
      onBlur,
      placeholder = "انتخاب کنید…",
      searchPlaceholder = "جستجو…",
      emptyMessage = "موردی یافت نشد",
      allowCustom = false,
      disabled,
      error,
      className,
      name,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const rootRef = React.useRef<HTMLDivElement>(null);

    const safeOptions = Array.isArray(options) ? options : [];
    const selected = safeOptions.find((o) => o.value === value);
    const display = selected?.label ?? (allowCustom && value ? value : "");

    const filtered = React.useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return safeOptions;
      return safeOptions.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.value.toLowerCase().includes(q)
      );
    }, [safeOptions, query]);

    React.useEffect(() => {
      function onDoc(e: MouseEvent) {
        if (!rootRef.current?.contains(e.target as Node)) {
          setOpen(false);
          setQuery("");
        }
      }
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    const pick = (v: string) => {
      onChange?.(v);
      setOpen(false);
      setQuery("");
    };

    return (
      <div ref={rootRef} className={cn("relative w-full", className)}>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((o) => !o)}
          onBlur={onBlur}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-text",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger",
            !display && "text-text-subtle"
          )}
        >
          <span className="truncate">{display || placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>

        <input ref={ref} type="hidden" name={name} value={value} readOnly />

        {open && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-2">
              <Search className="size-4 text-text-subtle" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full bg-transparent text-sm outline-none"
              />
            </div>
            <ul role="listbox" className="max-h-56 overflow-y-auto py-1 text-sm">
              {filtered.length === 0 && !allowCustom && (
                <li className="px-3 py-2 text-text-muted">{emptyMessage}</li>
              )}
              {filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={opt.value === value}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-right hover:bg-surface-muted",
                      opt.value === value && "bg-surface-muted font-medium"
                    )}
                    onClick={() => pick(opt.value)}
                  >
                    <Check
                      className={cn(
                        "size-3.5 shrink-0",
                        opt.value === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </button>
                </li>
              ))}
              {allowCustom &&
                query.trim() &&
                !safeOptions.some(
                  (o) => o.value === query.trim() || o.label === query.trim()
                ) && (
                  <li>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-right text-primary hover:bg-surface-muted"
                      onClick={() => pick(query.trim())}
                    >
                      استفاده از «{query.trim()}»
                    </button>
                  </li>
                )}
              {value && (
                <li className="border-t border-border">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-right text-text-muted hover:bg-surface-muted"
                    onClick={() => pick("")}
                  >
                    پاک کردن
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Combobox.displayName = "Combobox";
