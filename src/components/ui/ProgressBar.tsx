import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  colorClass?: string;
  className?: string;
  heightClass?: string;
}

export function ProgressBar({
  value,
  colorClass = "bg-primary",
  className,
  heightClass = "h-1.5",
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className={cn("w-full bg-surface-container rounded-full overflow-hidden", heightClass, className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", colorClass)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
