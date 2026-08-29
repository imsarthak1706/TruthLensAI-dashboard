"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { PerformanceTimePoint } from "@/types/analytics";

interface DetectionPerformanceChartProps {
  data: PerformanceTimePoint[];
}

export function DetectionPerformanceChart({ data }: DetectionPerformanceChartProps) {
  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
          Detection Performance Over Time
        </h3>
        <div className="flex items-center gap-4 font-code-sm text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
            <span>Accuracy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-tertiary inline-block" />
            <span>Precision</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" stroke="#889484" fontSize={11} fontFamily="JetBrains Mono" />
            <YAxis stroke="#889484" fontSize={11} fontFamily="JetBrains Mono" domain={[80, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161B22",
                borderColor: "#30363D",
                borderRadius: "4px",
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
                color: "#E2E2E8",
              }}
            />
            <Bar dataKey="accuracy" fill="#6fdd78" radius={[2, 2, 0, 0]} name="Accuracy %" />
            <Bar dataKey="precision" fill="#ffb1c4" radius={[2, 2, 0, 0]} name="Precision %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
