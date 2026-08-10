import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted/40 px-6 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="text-text-subtle" aria-hidden>
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-medium text-text">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
