import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({
  className,
  required,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-medium text-text",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="mr-1 text-danger" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}
