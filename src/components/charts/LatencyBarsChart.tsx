"use client";

import React from "react";
import { ModalityLatency } from "@/types/analytics";

interface LatencyBarsChartProps {
  items: ModalityLatency[];
  title?: string;
}

export function LatencyBarsChart({
  items,
  title = "Processing Time (Avg)",
}: LatencyBarsChartProps) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-4">
        {title}
      </h3>
      <div className="space-y-4 flex-1 flex flex-col justify-around">
        {items.map((item) => (
          <div key={item.modality}>
            <div className="flex justify-between font-code-sm text-code-sm mb-1">
              <span className="text-on-surface-variant">{item.modality}</span>
              <span className="text-on-surface font-semibold">{item.displayValue}</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded overflow-hidden">
              <div
                className={`h-full rounded transition-all duration-500 ${item.colorClass}`}
                style={{ width: `${item.barPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
