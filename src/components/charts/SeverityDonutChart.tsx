"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { SeverityDistributionData } from "@/types/scan";

interface SeverityDonutChartProps {
  data?: SeverityDistributionData;
}

export function SeverityDonutChart({
  data = {
    critical: 24,
    high: 186,
    suspicious: 632,
    safe: 11558,
    total: 12400,
  },
}: SeverityDonutChartProps) {
  const chartData = [
    { name: "Critical", value: data.critical, color: "#ffb4ab" },
    { name: "High Risk", value: data.high, color: "#e9638e" },
    { name: "Suspicious", value: data.suspicious, color: "#f9a826" },
    { name: "Safe", value: data.safe, color: "#6fdd78" },
  ];

  const totalThreats = data.critical + data.high + data.suspicious;

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
            Severity Distribution
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Telemetry classification across {data.total.toLocaleString()} scans
          </p>
        </div>
      </div>

      <div className="relative w-full h-44 flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={50}
              outerRadius={68}
              paddingAngle={3}
              dataKey="value"
              stroke="#161B22"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`${value.toLocaleString()} scans`, "Volume"]}
              contentStyle={{
                backgroundColor: "#161B22",
                borderColor: "#30363D",
                borderRadius: "4px",
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
                color: "#E2E2E8",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Threats Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display-lg text-2xl font-bold text-on-surface">
            {totalThreats.toLocaleString()}
          </span>
          <span className="font-label-caps text-[9px] text-error uppercase tracking-widest font-semibold">
            Threats ({((totalThreats / data.total) * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* 4-Tier Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-label-caps text-label-caps text-xs pt-3 border-t border-surface-variant/40">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-error shrink-0" />
          <span className="truncate">Critical ({data.critical})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-tertiary-container shrink-0" />
          <span className="truncate">High ({data.high})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f9a826] shrink-0" />
          <span className="truncate">Suspicious ({data.suspicious})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <span className="truncate">Safe ({(data.safe / 1000).toFixed(1)}k)</span>
        </div>
      </div>
    </div>
  );
}
