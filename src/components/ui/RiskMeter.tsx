import React from "react";
import { cn } from "@/lib/utils";

interface RiskMeterProps {
  score: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function RiskMeter({
  score,
  max = 100,
  size = 128,
  strokeWidth = 8,
  label = "Risk Score",
  className,
}: RiskMeterProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), max);
  const strokeDashoffset = circumference - (clampedScore / max) * circumference;

  let strokeColor = "#6fdd78"; // Safe green
  let textColor = "text-primary";
  let dropShadow = "drop-shadow-[0_0_8px_rgba(111,221,120,0.5)]";

  if (clampedScore >= 80) {
    strokeColor = "#ffb4ab"; // Critical red
    textColor = "text-error";
    dropShadow = "drop-shadow-[0_0_8px_rgba(255,180,171,0.5)]";
  } else if (clampedScore >= 60) {
    strokeColor = "#e9638e"; // High / Pink
    textColor = "text-tertiary-container";
    dropShadow = "drop-shadow-[0_0_8px_rgba(233,99,142,0.5)]";
  } else if (clampedScore >= 30) {
    strokeColor = "#c1c7d0"; // Suspicious / Yellow
    textColor = "text-secondary";
    dropShadow = "";
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#333539"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-700 ease-out", dropShadow)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn("font-display-lg text-3xl font-bold leading-none", textColor)}>
          {clampedScore}
        </span>
        {label && (
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase mt-1 tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
