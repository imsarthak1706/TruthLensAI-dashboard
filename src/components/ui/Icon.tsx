import React from "react";
import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  fill?: boolean | number;
  weight?: number;
  className?: string;
  size?: number | string;
}

export function Icon({ name, fill = false, weight = 400, className, size }: IconProps) {
  const fillVal = typeof fill === "number" ? fill : fill ? 1 : 0;
  return (
    <span
      className={cn("material-symbols-outlined select-none inline-flex items-center justify-center", className)}
      style={{
        fontVariationSettings: `'FILL' ${fillVal}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
        fontSize: size ? (typeof size === "number" ? `${size}px` : size) : undefined,
      }}
    >
      {name}
    </span>
  );
}
