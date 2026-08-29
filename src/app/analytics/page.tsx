"use client";

import React, { useEffect, useState } from "react";
import { analyticsService } from "@/services/analyticsService";
import {
  BenchmarkMetrics,
  ModalityLatency,
  ModalityMetricCard,
  PerformanceTimePoint,
  ThreatDistribution,
} from "@/types/analytics";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { DetectionPerformanceChart } from "@/components/charts/DetectionPerformanceChart";
import { LatencyBarsChart } from "@/components/charts/LatencyBarsChart";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<BenchmarkMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceTimePoint[]>([]);
  const [latencies, setLatencies] = useState<ModalityLatency[]>([]);
  const [threats, setThreats] = useState<ThreatDistribution[]>([]);
  const [modalityCards, setModalityCards] = useState<ModalityMetricCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, p, l, t, mc] = await Promise.all([
          analyticsService.getBenchmarkMetrics(),
          analyticsService.getPerformanceHistory(),
          analyticsService.getModalityLatency(),
          analyticsService.getThreatDistribution(),
          analyticsService.getModalityCards(),
        ]);
        setMetrics(m);
        setPerformance(p);
        setLatencies(l);
        setThreats(t);
        setModalityCards(mc);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-stack-lg max-w-7xl mx-auto pb-12">
      {/* Header */}
      <header>
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
          Detection Analytics &amp; Model Benchmark
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Evaluate TruthLensAI multimodal neural detection accuracy, latency, and forensic benchmarks.
        </p>
      </header>

      {/* Benchmark Metrics Row */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Development Benchmark ({metrics?.samplesCount || 120} labeled samples)
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {/* Accuracy */}
          <Card className="p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                ACCURACY
              </span>
              <Icon name="check_circle" className="text-primary text-xl" />
            </div>
            <div className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
              {metrics?.accuracy || 96.67}%
            </div>
          </Card>

          {/* Precision */}
          <Card className="p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                PRECISION
              </span>
              <Icon name="my_location" className="text-primary text-xl" />
            </div>
            <div className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
              {metrics?.precision || 100.0}%
            </div>
          </Card>

          {/* Recall */}
          <Card className="p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                RECALL
              </span>
              <Icon name="replay" className="text-primary text-xl" />
            </div>
            <div className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
              {metrics?.recall || 93.33}%
            </div>
          </Card>

          {/* F1 Score */}
          <Card className="p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                F1 SCORE
              </span>
              <Icon name="functions" className="text-primary text-xl" />
            </div>
            <div className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
              {metrics?.f1Score || 96.55}%
            </div>
          </Card>
        </div>
      </section>

      {/* Visualization Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        {/* Detection Performance (Spans 8 cols) */}
        <div className="xl:col-span-8 bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex flex-col min-h-[340px]">
          <DetectionPerformanceChart data={performance} />
        </div>

        {/* Latency by Modality (Spans 4 cols) */}
        <div className="xl:col-span-4 bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex flex-col min-h-[340px]">
          <LatencyBarsChart items={latencies} title="Latency by Modality (ms)" />
        </div>

        {/* Threat Type Distribution (Full width / 12 cols) */}
        <div className="xl:col-span-12 bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-6">
            Threat Type Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {threats.map((threat) => (
              <div key={threat.name} className="space-y-1.5">
                <div className="flex justify-between font-code-sm text-xs">
                  <span className="text-on-surface font-medium">{threat.name}</span>
                  <span className="font-bold" style={{ color: threat.color }}>
                    {threat.percentage}%
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{ width: `${threat.percentage}%`, backgroundColor: threat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modality Performance Detail Cards */}
      <section>
        <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-wider">
          Modality Performance Detail
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {modalityCards.map((card) => {
            let colorBorder = "hover:border-primary";
            let iconText = "text-primary";
            if (card.colorVariant === "secondary") {
              colorBorder = "hover:border-secondary";
              iconText = "text-secondary";
            } else if (card.colorVariant === "tertiary") {
              colorBorder = "hover:border-tertiary";
              iconText = "text-tertiary";
            } else if (card.colorVariant === "error") {
              colorBorder = "hover:border-error";
              iconText = "text-error";
            }

            return (
              <Card
                key={card.modality}
                className={`p-4 transition-colors cursor-default ${colorBorder}`}
              >
                <div className="flex items-center gap-3 mb-4 border-b border-surface-variant/40 pb-3">
                  <div
                    className={`w-8 h-8 rounded bg-[#0A0C10] border border-outline-variant flex items-center justify-center ${iconText}`}
                  >
                    <Icon name={card.icon} className="text-lg" />
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface font-bold">
                    {card.modality}
                  </span>
                </div>
                <div className="space-y-3 font-code-sm text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Detection Rate</span>
                    <span className="text-primary font-bold">{card.detectionRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Median Time</span>
                    <span className="text-on-surface font-semibold">{card.medianTime}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
