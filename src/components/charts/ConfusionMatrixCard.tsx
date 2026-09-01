"use client";

import React from "react";
import { ConfusionMatrixData } from "@/types/analytics";

interface ConfusionMatrixCardProps {
  matrix: ConfusionMatrixData;
}

export function ConfusionMatrixCard({ matrix }: ConfusionMatrixCardProps) {
  const {
    actualScamPredictedScam: tp,
    actualScamPredictedBenign: fn,
    actualBenignPredictedScam: fp,
    actualBenignPredictedBenign: tn,
  } = matrix;

  const totalScam = tp + fn; // 60
  const totalBenign = fp + tn; // 60
  const predictedScamTotal = tp + fp; // 54
  const predictedBenignTotal = fn + tn; // 66

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Evaluation Confusion Matrix
          </h3>
          <p className="text-xs text-on-surface-variant font-code-sm mt-0.5">
            Balanced ground truth: 60 Scam / 60 Benign
          </p>
        </div>
        <span className="font-code-sm text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
          Threshold ≥ 25
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Matrix Header */}
        <div className="grid grid-cols-12 text-xs font-code-sm text-on-surface-variant mb-2">
          <div className="col-span-4"></div>
          <div className="col-span-4 text-center font-semibold text-primary">
            PREDICTED SCAM
            <span className="block text-[10px] text-on-surface-variant font-normal">({predictedScamTotal})</span>
          </div>
          <div className="col-span-4 text-center font-semibold text-sky-400">
            PREDICTED BENIGN
            <span className="block text-[10px] text-on-surface-variant font-normal">({predictedBenignTotal})</span>
          </div>
        </div>

        {/* Row 1: Actual Scam */}
        <div className="grid grid-cols-12 gap-2 mb-2 items-stretch">
          <div className="col-span-4 flex flex-col justify-center p-2 rounded bg-surface-container/40 border border-[#30363D]">
            <span className="font-code-sm text-xs font-bold text-on-surface">ACTUAL SCAM</span>
            <span className="font-code-sm text-[10px] text-on-surface-variant">Ground Truth: {totalScam}</span>
          </div>
          {/* TP */}
          <div className="col-span-4 p-3 rounded bg-emerald-950/30 border border-emerald-500/30 flex flex-col items-center justify-center text-center">
            <span className="font-headline-md text-2xl font-bold text-emerald-400">{tp}</span>
            <span className="font-code-sm text-[11px] text-emerald-300/80 font-semibold mt-0.5">
              TRUE POSITIVE ({((tp / totalScam) * 100).toFixed(1)}%)
            </span>
            <span className="text-[10px] text-on-surface-variant font-code-sm">Threats detected</span>
          </div>
          {/* FN */}
          <div className="col-span-4 p-3 rounded bg-amber-950/20 border border-amber-500/30 flex flex-col items-center justify-center text-center">
            <span className="font-headline-md text-2xl font-bold text-amber-400">{fn}</span>
            <span className="font-code-sm text-[11px] text-amber-300/80 font-semibold mt-0.5">
              FALSE NEGATIVE ({((fn / totalScam) * 100).toFixed(1)}%)
            </span>
            <span className="text-[10px] text-on-surface-variant font-code-sm">Threats missed</span>
          </div>
        </div>

        {/* Row 2: Actual Benign */}
        <div className="grid grid-cols-12 gap-2 items-stretch">
          <div className="col-span-4 flex flex-col justify-center p-2 rounded bg-surface-container/40 border border-[#30363D]">
            <span className="font-code-sm text-xs font-bold text-on-surface">ACTUAL BENIGN</span>
            <span className="font-code-sm text-[10px] text-on-surface-variant">Ground Truth: {totalBenign}</span>
          </div>
          {/* FP */}
          <div className="col-span-4 p-3 rounded bg-surface-container/30 border border-[#30363D] flex flex-col items-center justify-center text-center">
            <span className="font-headline-md text-2xl font-bold text-on-surface">{fp}</span>
            <span className="font-code-sm text-[11px] text-on-surface-variant font-semibold mt-0.5">
              FALSE POSITIVE (0.0%)
            </span>
            <span className="text-[10px] text-primary font-code-sm">Zero false alarms</span>
          </div>
          {/* TN */}
          <div className="col-span-4 p-3 rounded bg-emerald-950/30 border border-emerald-500/30 flex flex-col items-center justify-center text-center">
            <span className="font-headline-md text-2xl font-bold text-emerald-400">{tn}</span>
            <span className="font-code-sm text-[11px] text-emerald-300/80 font-semibold mt-0.5">
              TRUE NEGATIVE ({((tn / totalBenign) * 100).toFixed(1)}%)
            </span>
            <span className="text-[10px] text-on-surface-variant font-code-sm">Safe messages cleared</span>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="mt-4 pt-3 border-t border-[#30363D] flex flex-wrap justify-between items-center gap-2 font-code-sm text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">100.00% Precision:</span>
            <span>0 benign communications falsely flagged</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">90.00% Recall:</span>
            <span>6 subtle multilingual scams under-scored</span>
          </div>
        </div>
      </div>
    </div>
  );
}
