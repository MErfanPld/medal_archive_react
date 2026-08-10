import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-border bg-surface text-text",
  danger: "border-danger/30 bg-danger-bg text-danger",
  success: "border-success/30 bg-success-bg text-success",
  warning: "border-warning/30 bg-warning-bg text-warning",
  info: "border-info/30 bg-info-bg text-info",
} as const;

export function Alert({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
