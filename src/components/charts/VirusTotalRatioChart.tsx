import React from "react";

interface VirusTotalRatioChartProps {
  malicious: number;
  suspicious: number;
  harmless: number;
}

export function VirusTotalRatioChart({
  malicious = 12,
  suspicious = 2,
  harmless = 60,
}: VirusTotalRatioChartProps) {
  const total = malicious + suspicious + harmless || 1;
  const malPct = (malicious / total) * 100;
  const suspPct = (suspicious / total) * 100;
  const stop1 = malPct;
  const stop2 = malPct + suspPct;

  return (
    <div
      className="relative w-16 h-16 rounded-full border-4 border-surface-container-highest overflow-hidden shrink-0"
      style={{
        background: `conic-gradient(#ffb4ab 0% ${stop1}%, #F9A826 ${stop1}% ${stop2}%, #6fdd78 ${stop2}% 100%)`,
      }}
    >
      <div className="absolute inset-2 bg-[#161B22] rounded-full" />
    </div>
  );
}
