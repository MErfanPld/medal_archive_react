import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text",
            "placeholder:text-text-subtle",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus-visible:outline-danger",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
