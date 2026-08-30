"use client";

import type { FormEvent, ReactNode } from "react";
import { Search, List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Shared admin list filter bar — same visual pattern as Coins page.
 * panel + flex wrap + search form + selects + optional view toggle
 */

export function ListFilters({ children }: { children: ReactNode }) {
  return (
    <div className="panel p-3 sm:p-4">
      <div className="flex flex-wrap items-end gap-3">{children}</div>
    </div>
  );
}

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
}

export function FilterSearchField({
  value,
  onChange,
  onSubmit,
  placeholder = "جستجو…",
  className,
}: SearchFieldProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex min-w-[200px] flex-1 gap-2", className)}
    >
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-9"
        />
      </div>
      <Button type="submit" variant="secondary">
        جستجو
      </Button>
    </form>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  allLabel: string;
  "aria-label": string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
  "aria-label": ariaLabel,
  className,
}: FilterSelectProps) {
  return (
    <select
      className={cn(
        "h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text",
        className
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

interface ViewToggleProps {
  view: "list" | "grid";
  onChange: (view: "list" | "grid") => void;
}

export function FilterViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-surface-muted/40 p-0.5"
      role="group"
      aria-label="حالت نمایش"
    >
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "rounded-md p-2 transition-colors",
          view === "list"
            ? "bg-surface text-text shadow-sm"
            : "text-text-muted hover:text-text"
        )}
        aria-pressed={view === "list"}
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "rounded-md p-2 transition-colors",
          view === "grid"
            ? "bg-surface text-text shadow-sm"
            : "text-text-muted hover:text-text"
        )}
        aria-pressed={view === "grid"}
      >
        <LayoutGrid className="size-4" />
      </button>
    </div>
  );
}
