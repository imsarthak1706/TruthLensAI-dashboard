import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: string;
}

export function Select({ icon, className, children, ...props }: SelectProps) {
  return (
    <div className="relative inline-block">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
          <Icon name={icon} className="text-sm" />
        </span>
      )}
      <select
        className={cn(
          "appearance-none bg-[#0A0C10] border border-[#30363D] text-on-surface font-label-caps text-label-caps rounded py-2 pr-9 focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-outline-variant transition-colors",
          icon ? "pl-9" : "px-3",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base">
        expand_more
      </span>
    </div>
  );
}
