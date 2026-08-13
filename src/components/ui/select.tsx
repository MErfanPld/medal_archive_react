import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  error?: string;
  /** Preferred data-driven options. Defaults to []. Never crashes if omitted. */
  options?: SelectOption[];
  placeholder?: string;
  /** Optional native <option> children (merged after options). */
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      error,
      options,
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    const safeOptions = Array.isArray(options) ? options : [];

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
          aria-invalid={error ? true : undefined}
          {...props}
        >
          {placeholder != null && placeholder !== "" && (
            <option value="">{placeholder}</option>
          )}
          {safeOptions.map((opt) => (
            <option
              key={String(opt.value)}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
          {children}
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
