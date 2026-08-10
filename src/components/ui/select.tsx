import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus-visible:outline-danger",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
