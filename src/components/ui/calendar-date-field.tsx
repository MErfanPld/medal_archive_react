"use client";

import * as React from "react";
import {
  type CalendarType,
  type CalendarParts,
  CALENDAR_LABELS,
  monthNames,
  daysInMonth,
  yearRange,
  parseIsoDate,
  toIsoDate,
  partsToGregorian,
  gregorianToParts,
  formatDisplay,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CalendarDateFieldProps {
  id?: string;
  value?: string | null;
  onChange?: (iso: string | null) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  defaultCalendar?: CalendarType;
}

export function CalendarDateField({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  error,
  className,
  defaultCalendar = "jalali",
}: CalendarDateFieldProps) {
  const [calendar, setCalendar] = React.useState<CalendarType>(defaultCalendar);

  const gregorian = React.useMemo(() => parseIsoDate(value ?? null), [value]);

  const parts: CalendarParts | null = React.useMemo(() => {
    if (!gregorian) return null;
    return gregorianToParts(gregorian, calendar);
  }, [gregorian, calendar]);

  const [year, setYear] = React.useState<number | "">(parts?.year ?? "");
  const [month, setMonth] = React.useState<number | "">(parts?.month ?? "");
  const [day, setDay] = React.useState<number | "">(parts?.day ?? "");

  React.useEffect(() => {
    if (parts) {
      setYear(parts.year);
      setMonth(parts.month);
      setDay(parts.day);
    } else {
      setYear("");
      setMonth("");
      setDay("");
    }
  }, [parts?.year, parts?.month, parts?.day, calendar]);

  const range = yearRange(calendar);
  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = range.max; y >= range.min; y--) list.push(y);
    return list;
  }, [range.min, range.max]);

  const maxDay =
    year !== "" && month !== ""
      ? daysInMonth(Number(year), Number(month), calendar)
      : 31;

  const emit = (y: number | "", m: number | "", d: number | "") => {
    if (y === "" || m === "" || d === "") {
      onChange?.(null);
      return;
    }
    const local: CalendarParts = {
      year: Number(y),
      month: Number(m),
      day: Math.min(Number(d), daysInMonth(Number(y), Number(m), calendar)),
    };
    const g = partsToGregorian(local, calendar);
    onChange?.(toIsoDate(g));
  };

  const onYear = (v: string) => {
    const y = v === "" ? "" : Number(v);
    setYear(y);
    emit(y, month, day);
  };
  const onMonth = (v: string) => {
    const m = v === "" ? "" : Number(v);
    setMonth(m);
    let d = day;
    if (year !== "" && m !== "" && day !== "") {
      const max = daysInMonth(Number(year), Number(m), calendar);
      if (Number(day) > max) {
        d = max;
        setDay(max);
      }
    }
    emit(year, m, d);
  };
  const onDay = (v: string) => {
    const d = v === "" ? "" : Number(v);
    setDay(d);
    emit(year, month, d);
  };

  const clear = () => {
    setYear("");
    setMonth("");
    setDay("");
    onChange?.(null);
  };

  const display = parts != null ? formatDisplay(parts, calendar) : null;

  return (
    <div className={cn("space-y-2", className)} id={id}>
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface-muted/40 p-1">
        {(Object.keys(CALENDAR_LABELS) as CalendarType[]).map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => setCalendar(c)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              calendar === c
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:bg-surface hover:text-text"
            )}
          >
            {CALENDAR_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2" onBlur={onBlur}>
        <select
          aria-label="روز"
          disabled={disabled}
          value={day === "" ? "" : String(day)}
          onChange={(e) => onDay(e.target.value)}
          className={selectClass(error)}
        >
          <option value="">روز</option>
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          aria-label="ماه"
          disabled={disabled}
          value={month === "" ? "" : String(month)}
          onChange={(e) => onMonth(e.target.value)}
          className={selectClass(error)}
        >
          <option value="">ماه</option>
          {monthNames(calendar).map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label="سال"
          disabled={disabled}
          value={year === "" ? "" : String(year)}
          onChange={(e) => onYear(e.target.value)}
          className={selectClass(error)}
        >
          <option value="">سال</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
        <span>
          {display
            ? `تاریخ انتخاب‌شده: ${display} (${CALENDAR_LABELS[calendar]})`
            : "تاریخی انتخاب نشده"}
        </span>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={clear}
            className="h-7 px-2 text-xs"
          >
            پاک کردن
          </Button>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function selectClass(error?: string) {
  return cn(
    "h-10 w-full rounded-lg border border-border bg-surface px-2 text-sm text-text",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    "disabled:cursor-not-allowed disabled:opacity-50",
    error && "border-danger"
  );
}
