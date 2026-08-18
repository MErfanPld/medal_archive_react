"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Check, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

const VARIANT = {
  success: {
    shell:
      "border-success/25 bg-surface/95 shadow-[0_12px_40px_-12px_rgba(45,106,79,0.35)]",
    bar: "bg-success",
    iconWrap: "bg-success-bg text-success ring-1 ring-success/20",
    Icon: Check,
  },
  error: {
    shell:
      "border-danger/25 bg-surface/95 shadow-[0_12px_40px_-12px_rgba(185,28,28,0.35)]",
    bar: "bg-danger",
    iconWrap: "bg-danger-bg text-danger ring-1 ring-danger/20",
    Icon: AlertTriangle,
  },
  info: {
    shell:
      "border-primary/20 bg-surface/95 shadow-[0_12px_40px_-12px_rgba(110,31,42,0.28)]",
    bar: "bg-primary",
    iconWrap: "bg-primary/10 text-primary-deep ring-1 ring-primary/15",
    Icon: Info,
  },
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = ++toastId;
      setItems((prev) => {
        const next = [...prev, { id, message, variant }];
        return next.slice(-3);
      });
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (m) => toast(m, "success"),
      error: (m) => toast(m, "error"),
      info: (m) => toast(m, "info"),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <style>{`
        @keyframes toastProgress { from { transform: scaleX(1); } to { transform: scaleX(0); } }
        .toast-progress { width: 100%; animation: toastProgress 4s linear forwards; }
      `}</style>
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2.5 px-4 sm:top-6"
        dir="rtl"
        aria-live="polite"
        aria-relevant="additions"
      >
        {items.map((t) => {
          const cfg = VARIANT[t.variant];
          const Icon = cfg.Icon;
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "animate-fade-up pointer-events-auto relative flex w-full max-w-md overflow-hidden rounded-2xl border backdrop-blur-xl",
                cfg.shell
              )}
            >
              <span
                className={cn("absolute inset-y-0 right-0 w-1", cfg.bar)}
                aria-hidden
              />

              <div className="flex flex-1 items-start gap-3 px-4 py-3.5 pr-5">
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                    cfg.iconWrap
                  )}
                >
                  <Icon className="size-4" strokeWidth={2.25} aria-hidden />
                </span>

                <p className="min-w-0 flex-1 pt-1.5 text-[0.875rem] font-medium leading-6 text-text">
                  {t.message}
                </p>

                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="mt-0.5 rounded-lg p-1.5 text-text-subtle transition-colors hover:bg-surface-muted hover:text-text"
                  aria-label="بستن اعلان"
                >
                  <X className="size-4" />
                </button>
              </div>

              <span
                className={cn(
                  "toast-progress absolute bottom-0 left-0 h-0.5 origin-right rounded-full opacity-80",
                  cfg.bar
                )}
                aria-hidden
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}
