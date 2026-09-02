"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl border border-border bg-surface shadow-lg",
          className
        )}
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="dialog-title" className="text-base font-semibold text-text">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-muted hover:bg-surface-muted"
            aria-label="بستن"
          >
            <X className="size-5" />
          </button>
        </div>
        {children && <div className="px-5 py-4">{children}</div>}
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: "danger" | "primary";
}

/**
 * In-page confirmation alert (not a modal).
 * Large, prominent banner fixed near the top of the viewport.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "تأیید",
  loading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-20 sm:pt-24"
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-alert-title"
        aria-describedby={description ? "confirm-alert-desc" : undefined}
        className={cn(
          "pointer-events-auto relative w-full max-w-2xl animate-fade-up",
          "rounded-2xl border-2 shadow-2xl backdrop-blur-sm",
          isDanger
            ? "border-danger/40 bg-gradient-to-br from-danger-bg via-surface to-surface"
            : "border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-surface"
        )}
      >
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:gap-6 sm:p-7">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl",
              isDanger
                ? "bg-danger/15 text-danger ring-1 ring-danger/25"
                : "bg-primary/15 text-primary ring-1 ring-primary/25"
            )}
            aria-hidden
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-7"
            >
              {isDanger ? (
                <>
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </>
              )}
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="confirm-alert-title"
              className="text-lg font-semibold tracking-tight text-text sm:text-xl"
            >
              {title}
            </h2>
            {description && (
              <p
                id="confirm-alert-desc"
                className="mt-2 text-sm leading-relaxed text-text-muted sm:text-[15px]"
              >
                {description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                type="button"
                variant={isDanger ? "danger" : "primary"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void onConfirm();
                }}
                loading={loading}
                disabled={loading}
                className="min-w-[7rem]"
              >
                {confirmLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                انصراف
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute left-4 top-4 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:static sm:shrink-0"
            aria-label="بستن"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
