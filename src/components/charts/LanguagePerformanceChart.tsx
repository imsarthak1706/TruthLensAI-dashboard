"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { LanguageBenchmarkMetric } from "@/types/analytics";

interface LanguagePerformanceChartProps {
  metrics: Record<"english" | "hindi" | "hinglish", LanguageBenchmarkMetric>;
}

export function LanguagePerformanceChart({ metrics }: LanguagePerformanceChartProps) {
  const chartData = [
    {
      name: "English",
      accuracy: metrics.english.accuracy,
      precision: metrics.english.precision,
      recall: metrics.english.recall,
      f1Score: metrics.english.f1Score,
      samples: metrics.english.samples,
    },
    {
      name: "Hindi",
      accuracy: metrics.hindi.accuracy,
      precision: metrics.hindi.precision,
      recall: metrics.hindi.recall,
      f1Score: metrics.hindi.f1Score,
      samples: metrics.hindi.samples,
    },
    {
      name: "Hinglish",
      accuracy: metrics.hinglish.accuracy,
      precision: metrics.hinglish.precision,
      recall: metrics.hinglish.recall,
      f1Score: metrics.hinglish.f1Score,
      samples: metrics.hinglish.samples,
    },
  ];

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div>
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Language Performance Comparison
          </h3>
          <p className="text-xs text-on-surface-variant font-code-sm mt-0.5">
            40 balanced samples per language (20 Scam / 20 Benign)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-code-sm text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#6fdd78] inline-block" />
            <span>Accuracy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8] inline-block" />
            <span>F1 Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ffb1c4] inline-block" />
            <span>Recall</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#a6cc70] inline-block" />
            <span>Precision</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
            <XAxis dataKey="name" stroke="#889484" fontSize={12} fontFamily="JetBrains Mono" />
            <YAxis
              stroke="#889484"
              fontSize={11}
              fontFamily="JetBrains Mono"
              domain={[60, 105]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value: any, name: string) => [`${value}%`, name]}
              contentStyle={{
                backgroundColor: "#161B22",
                borderColor: "#30363D",
                borderRadius: "6px",
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
                color: "#E2E2E8",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
            />
            <Bar dataKey="accuracy" fill="#6fdd78" radius={[2, 2, 0, 0]} name="Accuracy" maxBarSize={28} />
            <Bar dataKey="f1Score" fill="#38bdf8" radius={[2, 2, 0, 0]} name="F1 Score" maxBarSize={28} />
            <Bar dataKey="recall" fill="#ffb1c4" radius={[2, 2, 0, 0]} name="Recall" maxBarSize={28} />
            <Bar dataKey="precision" fill="#a6cc70" radius={[2, 2, 0, 0]} name="Precision" maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
