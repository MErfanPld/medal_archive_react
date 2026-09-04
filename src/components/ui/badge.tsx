import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-surface-muted text-text",
  primary: "bg-primary/10 text-primary-deep",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  secondary: "bg-surface-muted text-text-muted border border-border",
  outline: "border border-border text-text-muted",
} as const;

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
