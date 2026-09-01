"use client";

import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { scanService } from "@/services/scanService";
import { Icon } from "@/components/ui/Icon";

export function ThreatActivityChart() {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D">("30D");
  const [data, setData] = useState<{ time: string; threats: number; clean: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPoints() {
      setLoading(true);
      try {
        const points = await scanService.getThreatActivity(timeframe);
        setData(points);
      } finally {
        setLoading(false);
      }
    }
    fetchPoints();
  }, [timeframe]);

  return (
    <div className="w-full flex flex-col">
      {/* Header with Title, Legend & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Threat Activity &amp; Ingestion Volume
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Temporal threat telemetry from indexed scans
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 font-code-sm text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error inline-block" />
              <span>Flagged Threats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
              <span>Clean Traffic</span>
            </div>
          </div>

          <div className="flex bg-surface-container border border-surface-variant rounded p-1">
            {(["7D", "30D", "90D"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-xs font-label-caps uppercase transition-colors ${
                  timeframe === tf
                    ? "bg-surface-bright text-primary border border-surface-variant font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 border border-outline-variant/30 rounded bg-surface-container-lowest relative overflow-hidden p-2 flex items-center justify-center">
        {data && data.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffb4ab" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ffb4ab" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cleanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6fdd78" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6fdd78" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#889484"
                fontSize={11}
                fontFamily="JetBrains Mono"
                tickLine={false}
              />
              <YAxis
                stroke="#889484"
                fontSize={11}
                fontFamily="JetBrains Mono"
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`)}
              />
              <Tooltip
                formatter={(value: any, name: string) => [
                  `${value.toLocaleString()} scans`,
                  name === "threats" ? "Threats Detected" : "Clean Traffic",
                ]}
                contentStyle={{
                  backgroundColor: "#161B22",
                  borderColor: "#30363D",
                  borderRadius: "4px",
                  fontFamily: "JetBrains Mono",
                  fontSize: "12px",
                  color: "#E2E2E8",
                }}
              />
              <Area
                type="monotone"
                dataKey="clean"
                stroke="#6fdd78"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#cleanGrad)"
                name="clean"
              />
              <Area
                type="monotone"
                dataKey="threats"
                stroke="#ffb4ab"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#threatGrad)"
                name="threats"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <Icon name="history_toggle_off" className="text-on-surface-variant text-3xl opacity-40" />
            <p className="font-code-sm text-sm font-semibold text-on-surface">
              Historical telemetry not yet indexed
            </p>
            <p className="font-code-sm text-xs text-on-surface-variant/70 max-w-md">
              Time-series ingestion telemetry requires ongoing pipeline records. Perform scans in the scanner to populate live activity curves.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
