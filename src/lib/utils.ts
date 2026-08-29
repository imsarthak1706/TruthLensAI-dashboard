import { clsx, type ClassValue } from "clsx";
import { SeverityLevel } from "@/types/scan";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatRiskScore(score: number): string {
  return score < 10 ? `0${score}` : `${score}`;
}

export function getSeverityStyles(severity: SeverityLevel | string) {
  const norm = (severity || "").toLowerCase();
  switch (norm) {
    case 'critical':
      return {
        bg: 'bg-error/15',
        text: 'text-error',
        border: 'border-error/20',
        glow: 'shadow-[0_0_8px_rgba(255,180,171,0.2)]',
        indicator: 'bg-error',
      };
    case 'high':
    case 'high risk':
      return {
        bg: 'bg-tertiary-container/15',
        text: 'text-tertiary-container',
        border: 'border-tertiary-container/20',
        glow: 'shadow-[0_0_8px_rgba(233,99,142,0.2)]',
        indicator: 'bg-tertiary-container',
      };
    case 'suspicious':
    case 'medium':
      return {
        bg: 'bg-secondary/15',
        text: 'text-secondary',
        border: 'border-secondary/20',
        glow: '',
        indicator: 'bg-secondary',
      };
    case 'safe':
    case 'low':
    default:
      return {
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/20',
        glow: '',
        indicator: 'bg-primary',
      };
  }
}
