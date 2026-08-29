import React from "react";
import { cn } from "@/lib/utils";
import { SeverityLevel } from "@/types/scan";

interface BadgeProps {
  variant?: SeverityLevel | "open" | "investigating" | "resolved" | "neutral" | string;
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
  pulse?: boolean;
  glow?: boolean;
}

export function Badge({
  variant = "safe",
  children,
  className,
  showDot = false,
  pulse = false,
  glow = false,
}: BadgeProps) {
  const norm = variant.toLowerCase();

  let styles = "bg-primary/10 text-primary border-primary/20";
  let dotColor = "bg-primary";

  if (norm === "critical") {
    styles = cn(
      "bg-error/15 text-error border-error/30 ring-1 ring-error/20",
      glow && "shadow-[0_0_8px_rgba(255,180,171,0.25)]"
    );
    dotColor = "bg-error";
  } else if (norm === "high" || norm === "high risk") {
    styles = "bg-tertiary-container/15 text-tertiary-container border-tertiary-container/30 ring-1 ring-tertiary-container/20";
    dotColor = "bg-tertiary-container";
  } else if (norm === "suspicious" || norm === "medium") {
    styles = "bg-secondary/15 text-secondary border-secondary/30";
    dotColor = "bg-secondary";
  } else if (norm === "investigating") {
    styles = "bg-tertiary/15 text-tertiary border-tertiary/30";
    dotColor = "bg-tertiary";
  } else if (norm === "open") {
    styles = "bg-surface-bright text-on-surface border-surface-variant";
    dotColor = "bg-on-surface";
  } else if (norm === "resolved") {
    styles = "bg-secondary/10 text-secondary border-secondary/20";
    dotColor = "bg-secondary";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-label-caps uppercase font-bold tracking-wider border",
        styles,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full inline-block",
            dotColor,
            pulse && "animate-pulse"
          )}
        />
      )}
      {children}
    </span>
  );
}
