"use client";

import { cn } from "@/lib/utils";

type Kind = "medal" | "coin";

export function ItemPlaceholder({
  kind = "medal",
  className,
  label,
}: {
  kind?: Kind;
  className?: string;
  label?: string;
}) {
  const isCoin = kind === "coin";
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2",
        isCoin
          ? "bg-gradient-to-br from-amber-50 via-amber-100/80 to-amber-200/40"
          : "bg-gradient-to-br from-primary/[0.08] via-surface-muted to-primary/[0.14]",
        className
      )}
      aria-hidden
    >
      {isCoin ? (
        <svg
          viewBox="0 0 120 120"
          className="h-[46%] w-[46%] text-amber-700/70 drop-shadow-sm"
          fill="none"
        >
          <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="4" fill="currentColor" fillOpacity="0.12" />
          <circle cx="60" cy="60" r="36" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" fill="none" />
          <path d="M60 32v56M42 48h36M42 72h36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 120 120"
          className="h-[48%] w-[48%] text-primary/55 drop-shadow-sm"
          fill="none"
        >
          <circle cx="60" cy="52" r="34" stroke="currentColor" strokeWidth="4" fill="currentColor" fillOpacity="0.12" />
          <circle cx="60" cy="52" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M42 88c6-10 14-16 18-16s12 6 18 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M48 96h24l-4 10H52l-4-10z" fill="currentColor" fillOpacity="0.35" />
        </svg>
      )}
      {label ? (
        <span className="max-w-[80%] truncate text-center text-xs font-medium text-text-muted">
          {label}
        </span>
      ) : null}
    </div>
  );
}
