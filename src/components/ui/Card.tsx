import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 0 | 1 | 2;
  glow?: "primary" | "error" | "none";
}

export function Card({ level = 1, glow = "none", className, children, ...props }: CardProps) {
  const levelStyles = {
    0: "bg-surface-container-lowest border border-outline-variant",
    1: "bg-[#161B22] border border-[#30363D]",
    2: "bg-[#1C2128] border border-[#30363D] shadow-[0_0_20px_rgba(0,0,0,0.4)]",
  };

  const glowStyles = {
    none: "",
    primary: "hover:border-primary/50 shadow-[0_0_15px_rgba(111,221,120,0.08)]",
    error: "border-error/40 shadow-[0_0_15px_rgba(255,180,171,0.08)]",
  };

  return (
    <div
      className={cn("rounded-lg transition-colors relative", levelStyles[level], glowStyles[glow], className)}
      {...props}
    >
      {children}
    </div>
  );
}
