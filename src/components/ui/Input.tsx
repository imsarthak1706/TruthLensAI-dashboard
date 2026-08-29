import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors pointer-events-none">
            <Icon name={icon} className="text-lg" />
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-[#0A0C10] border border-[#30363D] rounded text-body-sm font-code-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all",
            icon ? "pl-10 pr-4 py-2" : "px-3 py-2",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
