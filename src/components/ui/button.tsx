import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  /**
   * When true, styles/behavior are applied to the single child element
   * instead of rendering a native <button>. `asChild` is never forwarded to the DOM.
   */
  asChild?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-deep focus-visible:outline-primary",
  secondary:
    "bg-surface-muted text-text hover:bg-border focus-visible:outline-primary",
  outline:
    "border border-border bg-surface text-text hover:bg-surface-muted focus-visible:outline-primary",
  ghost: "text-text-muted hover:bg-surface-muted hover:text-text",
  danger:
    "bg-danger text-white hover:bg-danger/90 focus-visible:outline-danger",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
  icon: "h-9 w-9 p-0",
};

function buttonClassName(
  variant: NonNullable<ButtonProps["variant"]>,
  size: NonNullable<ButtonProps["size"]>,
  className?: string
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      asChild = false,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = Boolean(disabled || loading);
    const classes = buttonClassName(variant, size, className);

    if (asChild) {
      if (!React.isValidElement(children)) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Button: asChild requires a single valid React element child."
          );
        }
        return null;
      }

      const child = children as React.ReactElement<{
        className?: string;
        ref?: React.Ref<unknown>;
        "aria-disabled"?: boolean | "true" | "false";
        tabIndex?: number;
        onClick?: (e: React.MouseEvent) => void;
      }>;

      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
        "aria-disabled": isDisabled || undefined,
        tabIndex: isDisabled ? -1 : child.props.tabIndex,
        onClick: (e: React.MouseEvent) => {
          if (isDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          child.props.onClick?.(e);
        },
        ref: child.props.ref ?? (ref as React.Ref<unknown>),
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={classes}
        {...props}
      >
        {loading && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
