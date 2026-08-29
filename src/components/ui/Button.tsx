import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "secondary" | "danger" | "danger-ghost";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-label-caps uppercase tracking-wider rounded font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-[11px] gap-1.5",
    md: "px-4 py-2 text-xs gap-2",
    lg: "px-6 py-3 text-sm gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-primary hover:bg-primary-fixed text-on-primary-fixed shadow-[0_0_10px_rgba(111,221,120,0.2)] hover:shadow-[0_0_15px_rgba(111,221,120,0.35)]",
    ghost:
      "bg-transparent border border-outline-variant hover:bg-surface-container-high text-on-surface hover:text-primary hover:border-primary/50",
    secondary:
      "bg-surface-container border border-surface-variant text-on-surface hover:bg-surface-container-high hover:border-outline-variant",
    danger:
      "bg-error/20 text-error border border-error/40 hover:bg-error/30 shadow-[0_0_10px_rgba(255,180,171,0.15)]",
    "danger-ghost":
      "border border-error/50 text-error hover:bg-error hover:text-on-error",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && iconPosition === "left" && <Icon name={icon} className="text-sm" />
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === "right" && <Icon name={icon} className="text-sm" />}
    </button>
  );
}
