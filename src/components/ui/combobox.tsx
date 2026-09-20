"use client";

import * as React from "react";
import { ChevronsUpDown, Check, Search, Plus } from "lucide-react";
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
  onCreateOption?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  allowCustom?: boolean;
  createLabel?: string;
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
      onCreateOption,
      onBlur,
      placeholder = "انتخاب کنید…",
      searchPlaceholder = "جستجو یا افزودن…",
      emptyMessage = "موردی یافت نشد",
      allowCustom = false,
      createLabel = "افزودن و انتخاب",
      disabled,
      error,
      className,
      name,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [adding, setAdding] = React.useState(false);
    const [newValue, setNewValue] = React.useState("");
    const rootRef = React.useRef<HTMLDivElement>(null);
    const addInputRef = React.useRef<HTMLInputElement>(null);

    const safeOptions = Array.isArray(options) ? options : [];
    const selected = safeOptions.find((o) => o.value === value);
    const display = selected?.label ?? (value ? value : "");

    const filtered = React.useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return safeOptions;
      return safeOptions.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.value.toLowerCase().includes(q)
      );
    }, [safeOptions, query]);

    const queryExists = React.useMemo(() => {
      const q = query.trim();
      if (!q) return false;
      return safeOptions.some(
        (o) =>
          o.value === q ||
          o.label === q ||
          o.label.toLowerCase() === q.toLowerCase()
      );
    }, [safeOptions, query]);

    React.useEffect(() => {
      function onDoc(e: MouseEvent) {
        if (!rootRef.current?.contains(e.target as Node)) {
          setOpen(false);
          setQuery("");
          setAdding(false);
          setNewValue("");
        }
      }
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    React.useEffect(() => {
      if (adding) {
        const t = window.setTimeout(() => addInputRef.current?.focus(), 30);
        return () => window.clearTimeout(t);
      }
    }, [adding]);

    const pick = (v: string) => {
      onChange?.(v);
      setOpen(false);
      setQuery("");
      setAdding(false);
      setNewValue("");
    };

    const createAndPick = (raw: string) => {
      const v = raw.trim();
      if (!v) return;
      onCreateOption?.(v);
      pick(v);
    };

    return (
      <div ref={rootRef} className={cn("relative w-full", className)}>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (disabled) return;
            setOpen((o) => !o);
            setAdding(false);
            setQuery("");
          }}
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
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    allowCustom &&
                    query.trim() &&
                    !queryExists
                  ) {
                    e.preventDefault();
                    createAndPick(query);
                  }
                }}
                placeholder={searchPlaceholder}
                className="h-9 w-full bg-transparent text-sm outline-none"
              />
            </div>

            <ul role="listbox" className="max-h-52 overflow-y-auto py-1 text-sm">
              {filtered.length === 0 && !(allowCustom && query.trim()) && (
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

              {allowCustom && query.trim() && !queryExists && (
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-right font-medium text-primary hover:bg-primary/5"
                    onClick={() => createAndPick(query)}
                  >
                    <Plus className="size-3.5 shrink-0" />
                    {createLabel} «{query.trim()}»
                  </button>
                </li>
              )}
            </ul>

            {allowCustom && (
              <div className="border-t border-border bg-surface-muted/40">
                {!adding ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
                    onClick={() => {
                      setAdding(true);
                      setNewValue(query.trim());
                    }}
                  >
                    <Plus className="size-3.5" />
                    افزودن مورد جدید
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-2">
                    <input
                      ref={addInputRef}
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          createAndPick(newValue);
                        }
                        if (e.key === "Escape") {
                          setAdding(false);
                          setNewValue("");
                        }
                      }}
                      placeholder="نام مورد جدید…"
                      className="h-9 min-w-0 flex-1 rounded-md border border-border bg-surface px-2 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                    />
                    <button
                      type="button"
                      className="shrink-0 rounded-md bg-primary px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                      disabled={!newValue.trim()}
                      onClick={() => createAndPick(newValue)}
                    >
                      ذخیره
                    </button>
                  </div>
                )}
              </div>
            )}

            {value && (
              <div className="border-t border-border">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-right text-sm text-text-muted hover:bg-surface-muted"
                  onClick={() => pick("")}
                >
                  پاک کردن انتخاب
                </button>
              </div>
            )}
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
