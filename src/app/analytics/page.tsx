"use client";

import React, { useEffect, useState } from "react";
import { analyticsService } from "@/services/analyticsService";
import { BenchmarkEvaluationData } from "@/types/analytics";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { LanguagePerformanceChart } from "@/components/charts/LanguagePerformanceChart";
import { ConfusionMatrixCard } from "@/components/charts/ConfusionMatrixCard";

export default function AnalyticsPage() {
  const [data, setData] = useState<BenchmarkEvaluationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const evalData = await analyticsService.getBenchmarkEvaluation();
        setData(evalData);
      } catch (err) {
        console.error("Failed to load benchmark analytics", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-on-surface-variant font-code-sm text-sm">
          <Icon name="sync" className="animate-spin text-primary text-lg" />
          <span>Loading benchmark evaluation...</span>
        </div>
      </div>
    );
  }

  const { overall, byLanguage, confusionMatrix, errors, provenance } = data;

  return (
    <div className="space-y-stack-lg max-w-7xl mx-auto pb-12">
      {/* Header with Explicit Provenance Badge */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-code-sm text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold tracking-wide uppercase">
                Model Evaluation
              </span>
              <span className="font-code-sm text-xs px-2.5 py-0.5 rounded-full bg-[#161B22] text-on-surface-variant border border-[#30363D]">
                Production Threshold = {provenance.productionThreshold}
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
              Detection Benchmark &amp; Model Evaluation
            </h1>
          </div>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
          Empirical evaluation results of the TruthLensAI text detection pipeline on the balanced 120-sample
          benchmark. Evaluated against <code className="text-primary font-code-sm bg-[#161B22] px-1.5 py-0.5 rounded border border-[#30363D]">benchmark/text_benchmark.csv</code> using
          the exact production FastAPI <code className="text-primary font-code-sm bg-[#161B22] px-1.5 py-0.5 rounded border border-[#30363D]">POST /api/scan</code> detection pipeline.
        </p>

        {/* Provenance Context Banner */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 font-code-sm text-xs text-on-surface-variant flex flex-wrap gap-y-2 justify-between items-center">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span>
              <strong className="text-on-surface">Dataset:</strong> {provenance.benchmarkName} ({overall.samplesCount} samples)
            </span>
            <span>
              <strong className="text-on-surface">Composition:</strong> {provenance.balanceDescription}
            </span>
            <span>
              <strong className="text-on-surface">Languages:</strong> {provenance.languages.join(", ")}
            </span>
          </div>
          <div className="text-on-surface-variant/70">
            Evaluation Date: {provenance.evaluationTimestamp.split("T")[0]}
          </div>
        </div>
      </header>

      {/* Top Level Overall KPI Cards */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Overall Benchmark Performance ({overall.samplesCount} samples)
          </h2>
          <span className="text-xs font-code-sm text-on-surface-variant">
            Ground Truth: {overall.totalScam} Scam / {overall.totalBenign} Benign
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {/* Accuracy */}
          <Card className="p-4 relative overflow-hidden group border-[#30363D] bg-[#161B22]">
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                ACCURACY
              </span>
              <Icon name="check_circle" className="text-[#6fdd78] text-xl" />
            </div>
            <div className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
              {overall.accuracy.toFixed(2)}%
            </div>
            <p className="text-[11px] font-code-sm text-on-surface-variant mt-1.5">
              {overall.tp + overall.tn} / {overall.samplesCount} correct predictions
            </p>
          </Card>

          {/* Precision */}
          <Card className="p-4 relative overflow-hidden group border-[#30363D] bg-[#161B22]">
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                PRECISION
              </span>
              <Icon name="my_location" className="text-[#a6cc70] text-xl" />
            </div>
            <div className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
              {overall.precision.toFixed(2)}%
            </div>
            <p className="text-[11px] font-code-sm text-[#6fdd78] mt-1.5 flex items-center gap-1 font-semibold">
              <Icon name="verified" className="text-xs" />
              0 False Positives on benign inputs
            </p>
          </Card>

          {/* Recall */}
          <Card className="p-4 relative overflow-hidden group border-[#30363D] bg-[#161B22]">
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                RECALL
              </span>
              <Icon name="replay" className="text-[#ffb1c4] text-xl" />
            </div>
            <div className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
              {overall.recall.toFixed(2)}%
            </div>
            <p className="text-[11px] font-code-sm text-on-surface-variant mt-1.5">
              {overall.tp} / {overall.totalScam} threats detected
            </p>
          </Card>

          {/* F1 Score */}
          <Card className="p-4 relative overflow-hidden group border-[#30363D] bg-[#161B22]">
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                F1 SCORE
              </span>
              <Icon name="functions" className="text-[#38bdf8] text-xl" />
            </div>
            <div className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">
              {overall.f1Score.toFixed(2)}%
            </div>
            <p className="text-[11px] font-code-sm text-on-surface-variant mt-1.5">
              Harmonic mean of precision &amp; recall
            </p>
          </Card>
        </div>

        {/* Detailed Confusion Count Summary */}
        <div className="bg-[#0A0C10] border border-[#30363D] rounded-lg p-3 px-4 flex flex-wrap items-center justify-between gap-4 font-code-sm text-xs">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-on-surface-variant">
              True Positives (TP): <strong className="text-[#6fdd78]">{overall.tp}</strong>
            </span>
            <span className="text-on-surface-variant">
              True Negatives (TN): <strong className="text-[#6fdd78]">{overall.tn}</strong>
            </span>
            <span className="text-on-surface-variant">
              False Positives (FP): <strong className="text-on-surface">{overall.fp}</strong>
            </span>
            <span className="text-on-surface-variant">
              False Negatives (FN): <strong className="text-amber-400">{overall.fn}</strong>
            </span>
          </div>
          <div className="text-on-surface-variant text-[11px]">
            *Evaluation condition: 95.00% accuracy on the 120-sample text benchmark.
          </div>
        </div>
      </section>

      {/* Visualizations Grid: Language Chart (7 cols) + Confusion Matrix (5 cols) */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        <div className="xl:col-span-7 bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex flex-col min-h-[360px]">
          <LanguagePerformanceChart metrics={byLanguage} />
        </div>
        <div className="xl:col-span-5 bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex flex-col min-h-[360px]">
          <ConfusionMatrixCard matrix={confusionMatrix} />
        </div>
      </section>

      {/* Language Breakdown Detail Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Language Performance Breakdown
          </h2>
          <p className="text-xs text-on-surface-variant font-code-sm mt-0.5">
            40 labeled samples per language (20 Scam / 20 Benign)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* English */}
          <Card className="p-5 bg-[#161B22] border-[#30363D] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#30363D] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#6fdd78]" />
                  <span className="font-headline-sm text-base font-bold text-on-surface">English</span>
                </div>
                <span className="font-code-sm text-xs px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-semibold">
                  100.00% ACC
                </span>
              </div>

              <div className="space-y-2.5 font-code-sm text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Accuracy</span>
                  <span className="text-[#6fdd78] font-bold">{byLanguage.english.accuracy.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Precision</span>
                  <span className="text-on-surface font-semibold">{byLanguage.english.precision.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Recall</span>
                  <span className="text-on-surface font-semibold">{byLanguage.english.recall.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">F1 Score</span>
                  <span className="text-[#38bdf8] font-bold">{byLanguage.english.f1Score.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#30363D] flex justify-between font-code-sm text-[11px] text-on-surface-variant">
              <span>Samples: {byLanguage.english.samples}</span>
              <span className="text-[#6fdd78]">TP: {byLanguage.english.tp} | TN: {byLanguage.english.tn} | FN: 0</span>
            </div>
          </Card>

          {/* Hindi */}
          <Card className="p-5 bg-[#161B22] border-[#30363D] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#30363D] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="font-headline-sm text-base font-bold text-on-surface">Hindi</span>
                </div>
                <span className="font-code-sm text-xs px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/30 font-semibold">
                  87.50% ACC
                </span>
              </div>

              <div className="space-y-2.5 font-code-sm text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Accuracy</span>
                  <span className="text-amber-400 font-bold">{byLanguage.hindi.accuracy.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Precision</span>
                  <span className="text-[#6fdd78] font-semibold">{byLanguage.hindi.precision.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Recall</span>
                  <span className="text-amber-400 font-semibold">{byLanguage.hindi.recall.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">F1 Score</span>
                  <span className="text-[#38bdf8] font-bold">{byLanguage.hindi.f1Score.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#30363D] flex justify-between font-code-sm text-[11px] text-on-surface-variant">
              <span>Samples: {byLanguage.hindi.samples}</span>
              <span className="text-amber-400">TP: {byLanguage.hindi.tp} | TN: {byLanguage.hindi.tn} | FN: 5</span>
            </div>
          </Card>

          {/* Hinglish */}
          <Card className="p-5 bg-[#161B22] border-[#30363D] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#30363D] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#6fdd78]" />
                  <span className="font-headline-sm text-base font-bold text-on-surface">Hinglish</span>
                </div>
                <span className="font-code-sm text-xs px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-semibold">
                  97.50% ACC
                </span>
              </div>

              <div className="space-y-2.5 font-code-sm text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Accuracy</span>
                  <span className="text-[#6fdd78] font-bold">{byLanguage.hinglish.accuracy.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Precision</span>
                  <span className="text-[#6fdd78] font-semibold">{byLanguage.hinglish.precision.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Recall</span>
                  <span className="text-on-surface font-semibold">{byLanguage.hinglish.recall.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">F1 Score</span>
                  <span className="text-[#38bdf8] font-bold">{byLanguage.hinglish.f1Score.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#30363D] flex justify-between font-code-sm text-[11px] text-on-surface-variant">
              <span>Samples: {byLanguage.hinglish.samples}</span>
              <span className="text-[#6fdd78]">TP: {byLanguage.hinglish.tp} | TN: {byLanguage.hinglish.tn} | FN: 1</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Honest Limitations & False Negative Analysis Section */}
      <section className="bg-[#161B22] border border-[#30363D] rounded-lg p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="warning" className="text-amber-400 text-lg" />
              <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                Evaluation Limitations &amp; Error Analysis
              </h2>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant max-w-3xl">
              <strong className="text-on-surface font-semibold">6 scam samples were missed, all false negatives (0 false positives).</strong>{" "}
              Hindi/Hinglish subtle social-engineering patterns were under-scored when AI analysis was unavailable.
              The deterministic regex rules alone provided 15–20 risk points (below the production threshold of 25),
              causing them to be classified as SAFE.
            </p>
          </div>
          <div className="font-code-sm text-xs px-3 py-1.5 rounded bg-amber-950/20 border border-amber-500/30 text-amber-300">
            Precision remains 100.00% (No Benign Blocked)
          </div>
        </div>

        {/* Detailed Error Table */}
        <div className="overflow-x-auto border border-[#30363D] rounded-lg">
          <table className="w-full text-left font-code-sm text-xs">
            <thead className="bg-[#0A0C10] text-on-surface-variant border-b border-[#30363D]">
              <tr>
                <th className="py-2.5 px-3">Sample ID</th>
                <th className="py-2.5 px-3">Language</th>
                <th className="py-2.5 px-3">Expected</th>
                <th className="py-2.5 px-3">Predicted</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Sample Text Preview</th>
                <th className="py-2.5 px-3">Under-Scoring Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D] text-on-surface">
              {errors.map((err) => (
                <tr key={err.id} className="hover:bg-surface-container/20 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-primary">{err.id}</td>
                  <td className="py-2.5 px-3 text-on-surface-variant capitalize">{err.language}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">{err.expected}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-semibold">{err.predicted}</td>
                  <td className="py-2.5 px-3 font-bold">{err.score} / 100</td>
                  <td className="py-2.5 px-3 text-on-surface-variant">{err.severity}</td>
                  <td className="py-2.5 px-3 max-w-xs truncate text-on-surface-variant" title={err.text}>
                    &quot;{err.text}&quot;
                  </td>
                  <td className="py-2.5 px-3 text-on-surface-variant/80 text-[11px]">{err.analysisReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#0A0C10] border border-[#30363D] rounded p-3 text-xs font-code-sm text-on-surface-variant flex items-center gap-2">
          <Icon name="info" className="text-primary text-base shrink-0" />
          <span>
            <strong>Scope Notice:</strong> 95.00% accuracy applies strictly to the 120-sample text benchmark under evaluation conditions. It does not imply a general 95% accuracy claim across live production traffic or other modalities (image, audio, video).
          </span>
        </div>
      </section>
    </div>
  );
}
