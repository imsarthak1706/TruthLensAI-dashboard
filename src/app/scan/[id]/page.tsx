"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { scanService } from "@/services/scanService";
import { incidentService } from "@/services/incidentService";
import { ScanResult } from "@/types/scan";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VirusTotalRatioChart } from "@/components/charts/VirusTotalRatioChart";

export default function ScanResultDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "TRUTH-X92-A74B";

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<"scam" | "safe" | null>(null);
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    async function loadScan() {
      try {
        const data = await scanService.getScanById(id);
        setScan(data);
      } catch (err) {
        console.error("Failed to load scan details", err);
      } finally {
        setLoading(false);
      }
    }
    loadScan();
  }, [id]);

  const handleCopy = () => {
    if (!scan) return;
    navigator.clipboard.writeText(
      `TruthLensAI Forensic Report | ID: ${scan.id} | Risk Score: ${scan.riskScore}/100 (${scan.severity.toUpperCase()}) | Headline: ${scan.headline} | Recommendation: ${scan.recommendation}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReportIncident = async () => {
    if (!scan || reporting) return;
    try {
      setReporting(true);
      const incident = await incidentService.createIncidentFromScan(scan);
      router.push(`/incidents?selectedId=${incident.id}`);
    } catch (err) {
      console.error("Failed to create incident from scan", err);
      router.push("/incidents");
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-code-sm text-sm text-on-surface-variant">
          Retrieving Forensic Analysis Telemetry...
        </p>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="text-center py-20 space-y-4">
        <Icon name="error" className="text-5xl text-error" />
        <h3 className="font-headline-md text-on-surface">Scan Not Found</h3>
        <Link href="/history">
          <Button variant="secondary">Return to Scan History</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-stack-lg max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/history"
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-label-caps text-xs uppercase"
            >
              <Icon name="arrow_back" className="text-sm" /> History
            </Link>
            <span className="text-on-surface-variant/40">•</span>
            <span className="font-label-caps text-xs text-primary uppercase font-bold">
              Forensic Threat Report
            </span>
          </div>
          <h1 className="font-display-lg text-3xl md:text-4xl font-bold text-on-surface">
            TruthLensAI Analysis
          </h1>
          <p className="font-code-sm text-xs md:text-sm text-on-surface-variant mt-1">
            Scan ID: <span className="text-on-surface font-semibold">{scan.id}</span> | Timestamp: {scan.timestamp}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="md"
            icon={copied ? "check" : "content_copy"}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy Result"}
          </Button>
          <Button
            variant="danger"
            size="md"
            icon={reporting ? "sync" : "flag"}
            disabled={reporting}
            onClick={handleReportIncident}
          >
            {reporting ? "Creating..." : "Report Incident"}
          </Button>
        </div>
      </div>

      {/* Screen Hierarchy Centerpiece: Risk -> Recommendation / Action */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Stage 1: Main Risk Card (Spans 8 columns) */}
        <div
          className={`md:col-span-8 bg-[#161B22] border rounded-lg p-6 relative overflow-hidden group ${
            scan.severity === "critical"
              ? "border-error/50 shadow-[0_0_20px_rgba(255,180,171,0.1)]"
              : scan.severity === "high"
              ? "border-tertiary-container/50 shadow-[0_0_20px_rgba(233,99,142,0.1)]"
              : scan.severity === "suspicious"
              ? "border-[#30363D]"
              : "border-primary/40"
          }`}
        >
          {/* Edge Glow Bar */}
          <div
            className={`absolute top-0 left-0 w-1 h-full animate-pulse ${
              scan.severity === "critical"
                ? "bg-error shadow-[0_0_8px_rgba(255,180,171,0.8)]"
                : scan.severity === "high"
                ? "bg-tertiary-container shadow-[0_0_8px_rgba(233,99,142,0.8)]"
                : scan.severity === "suspicious"
                ? "bg-secondary"
                : "bg-primary shadow-[0_0_8px_rgba(111,221,120,0.8)]"
            }`}
          />

          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="space-y-4 flex-1">
              <Badge
                variant={scan.severity}
                glow={scan.severity === "critical" || scan.severity === "high"}
                showDot={true}
                pulse={scan.severity === "critical"}
              >
                {scan.severity.toUpperCase()} {scan.severity === "safe" ? "STATUS" : "THREAT"}
              </Badge>

              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
                  {scan.headline}
                </h3>
                <p className="font-code-sm text-code-sm text-on-surface-variant break-all bg-[#0C0E12] p-2.5 rounded border border-outline-variant inline-block select-all max-w-full">
                  {scan.targetInput}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                    Confidence
                  </p>
                  <p
                    className={`font-body-md text-body-md font-bold ${
                      scan.severity === "critical"
                        ? "text-error"
                        : scan.severity === "high"
                        ? "text-tertiary-container"
                        : "text-primary"
                    }`}
                  >
                    {scan.confidenceLabel}
                  </p>
                </div>
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                    Input Modality
                  </p>
                  <p className="font-body-md text-body-md text-on-surface uppercase font-medium">
                    {scan.modality} Analysis Engine
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Meter Gauge */}
            <div className="flex flex-col items-center justify-center bg-[#0C0E12] p-6 rounded-lg border border-outline-variant sm:w-48 w-full shrink-0 relative">
              <RiskMeter score={scan.riskScore} size={120} strokeWidth={8} label="Risk Score" />
            </div>
          </div>
        </div>

        {/* Stage 6: Recommendation & SOC Feedback Loop (Spans 4 columns) */}
        <div className="md:col-span-4 bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="policy" className="text-primary text-xl" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                SOC Recommendation
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {scan.recommendation}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#30363D]">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-3 text-center">
              Was this analysis correct?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setFeedback("scam")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded text-on-surface transition-all font-label-caps text-xs uppercase ${
                  feedback === "scam"
                    ? "bg-error/20 border border-error text-error font-bold shadow-[0_0_8px_rgba(255,180,171,0.2)]"
                    : "bg-surface-container border border-outline-variant hover:bg-error/10 hover:border-error/50 hover:text-error"
                }`}
              >
                <Icon name="thumb_down" className="text-[16px]" />
                <span>Scam (Correct)</span>
              </button>
              <button
                onClick={() => setFeedback("safe")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded text-on-surface transition-all font-label-caps text-xs uppercase ${
                  feedback === "safe"
                    ? "bg-primary/20 border border-primary text-primary font-bold shadow-[0_0_8px_rgba(111,221,120,0.2)]"
                    : "bg-surface-container border border-outline-variant hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                }`}
              >
                <Icon name="thumb_up" className="text-[16px]" />
                <span>Safe (False Pos)</span>
              </button>
            </div>
            {feedback && (
              <p className="text-[11px] font-code-sm text-primary text-center mt-2 animate-in fade-in duration-150">
                ✓ Feedback recorded to community neural model.
              </p>
            )}
          </div>
        </div>

        {/* Stage 2 & 3: Evidence & AI Analysis (Spans 6 columns) */}
        <div className="md:col-span-6 bg-[#161B22] border border-[#30363D] rounded-lg p-0 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#30363D] bg-[#0C0E12] flex items-center space-x-2">
            <Icon name="psychology" className="text-tertiary text-xl" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Evidence &amp; Forensic Signals
            </h3>
          </div>

          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            {/* Evidence Checklist */}
            <div className="space-y-3">
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2">
                Why this was flagged ({scan.evidence.length} Signals)
              </p>
              <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {scan.evidence.map((ev) => (
                  <div key={ev.id} className="flex items-start space-x-3 bg-[#0A0C10]/60 p-2.5 rounded border border-outline-variant/30">
                    <Icon
                      name={ev.severity === "safe" ? "check_circle" : "warning"}
                      fill={true}
                      className={`mt-0.5 text-[18px] shrink-0 ${
                        ev.severity === "safe" ? "text-primary" : "text-error"
                      }`}
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="font-body-sm text-body-sm text-on-surface font-semibold leading-snug">
                        {ev.title}
                      </p>
                      <p className="font-code-sm text-on-surface-variant text-[11px] mt-0.5">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OCR Extracted Text Module (Image Modality) */}
            {scan.extractedText && (
              <div className="bg-[#0A0C10] border border-primary/30 rounded p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-primary">
                  <Icon name="document_scanner" className="text-base" />
                  <span className="font-label-caps text-[11px] uppercase font-bold">
                    OCR Extracted Text
                  </span>
                </div>
                <p className="font-code-sm text-xs text-on-surface bg-[#161B22] p-2.5 rounded border border-outline-variant/40 break-words leading-relaxed select-all">
                  {scan.extractedText}
                </p>
              </div>
            )}

            {/* Audio Speech Transcript Module (Audio Modality) */}
            {scan.modality === "audio" && scan.transcript && (
              <div className="bg-[#0A0C10] border border-primary/30 rounded p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-primary">
                  <Icon name="graphic_eq" className="text-base" />
                  <span className="font-label-caps text-[11px] uppercase font-bold">
                    Whisper Speech Transcript
                  </span>
                </div>
                <p className="font-code-sm text-xs text-on-surface bg-[#161B22] p-2.5 rounded border border-outline-variant/40 break-words leading-relaxed select-all">
                  "{scan.transcript}"
                </p>
              </div>
            )}

            {/* Video Forensics & Transcription Module (Video Modality) */}
            {scan.modality === "video" && (
              <div className="bg-[#0A0C10] border border-outline-variant rounded p-3.5 space-y-2">
                {scan.transcript && (
                  <div>
                    <span className="font-label-caps text-[10px] text-primary uppercase font-bold block mb-1">
                      Spoken Audio Transcript:
                    </span>
                    <p className="font-code-sm text-xs text-on-surface bg-[#161B22] p-2 rounded border border-outline-variant/40">
                      "{scan.transcript}"
                    </p>
                  </div>
                )}
                {scan.frameOcrText && (
                  <div>
                    <span className="font-label-caps text-[10px] text-tertiary uppercase font-bold block mb-1">
                      On-Screen Keyframe OCR:
                    </span>
                    <p className="font-code-sm text-xs text-on-surface bg-[#161B22] p-2 rounded border border-outline-variant/40">
                      {scan.frameOcrText}
                    </p>
                  </div>
                )}
                {scan.videoMetadata && (
                  <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-code-sm text-on-surface-variant border-t border-surface-variant/30">
                    <span>Duration: <strong className="text-on-surface">{scan.videoMetadata.duration_seconds ? `${scan.videoMetadata.duration_seconds.toFixed(1)}s` : "--"}</strong></span>
                    <span>Dimensions: <strong className="text-on-surface">{scan.videoMetadata.width}x{scan.videoMetadata.height}</strong></span>
                    <span>Audio Track: <strong className="text-on-surface">{scan.videoMetadata.has_audio ? "Present" : "None"}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Image Forensics Metadata Module (EXIF / ELA) */}
            {scan.imageForensics && (
              <div className="bg-[#0A0C10] border border-outline-variant rounded p-3 space-y-2 text-xs font-code-sm">
                <div className="flex items-center justify-between border-b border-surface-variant/30 pb-1.5">
                  <span className="text-on-surface-variant font-label-caps uppercase text-[10px]">
                    EXIF Metadata Tags
                  </span>
                  <span className={scan.imageForensics.exif?.available ? "text-primary font-bold" : "text-on-surface-variant"}>
                    {scan.imageForensics.exif?.available ? "Available" : "Not Present"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant font-label-caps uppercase text-[10px]">
                    Error Level Analysis (ELA)
                  </span>
                  <span className={scan.imageForensics.ela?.supported ? "text-primary font-bold" : "text-on-surface-variant"}>
                    {scan.imageForensics.ela?.supported ? (scan.imageForensics.ela.possible_editing_indicators ? "Potential Compression Artifacts" : "Consistent Compression") : scan.imageForensics.ela?.reason || "Not Applicable"}
                  </span>
                </div>
              </div>
            )}

            {/* AI Summary Box */}
            <div className="bg-[#0C0E12] border border-outline-variant rounded p-4 relative mt-2">
              <div className="absolute -top-3 left-4 bg-[#0C0E12] px-2 text-tertiary flex items-center gap-1">
                <Icon name="neurology" className="text-sm" />
                <span className="font-label-caps text-[10px] uppercase font-bold">
                  Neural Intent Breakdown
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-relaxed mt-1">
                {scan.aiExplanation}
              </p>

              {/* Breakdown Bars */}
              <div className="mt-4 space-y-2.5 pt-3 border-t border-surface-variant/40">
                {scan.breakdown.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-1 font-code-sm">
                      <span className="text-on-surface-variant">{item.name}</span>
                      <span
                        className={
                          item.score >= 70
                            ? "text-error font-bold"
                            : item.score > 0
                            ? "text-tertiary-container font-bold"
                            : "text-primary font-semibold"
                        }
                      >
                        {item.score}%
                      </span>
                    </div>
                    <ProgressBar
                      value={item.score}
                      colorClass={
                        item.score >= 70
                          ? "bg-error"
                          : item.score > 0
                          ? "bg-tertiary-container"
                          : "bg-primary"
                      }
                      heightClass="h-1.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stage 4 & 5: External Intelligence & Community Intelligence (Spans 6 columns) */}
        <div className="md:col-span-6 flex flex-col gap-gutter">
          {/* VirusTotal External Intelligence */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Icon name="travel_explore" className="text-secondary text-xl" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                External Intelligence
              </h3>
              <span className="font-label-caps text-[11px] text-on-surface-variant ml-auto bg-surface-container-highest px-2 py-0.5 rounded border border-surface-variant">
                VirusTotal Engine
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-6">
                <div className="text-center">
                  <span className="block font-display-lg text-2xl font-bold text-error">
                    {scan.externalIntel.maliciousCount}
                  </span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Malicious
                  </span>
                </div>
                <div className="text-center">
                  <span className="block font-display-lg text-2xl font-bold text-[#F9A826]">
                    {scan.externalIntel.suspiciousCount}
                  </span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Suspicious
                  </span>
                </div>
                <div className="text-center">
                  <span className="block font-display-lg text-2xl font-bold text-primary">
                    {scan.externalIntel.harmlessCount}
                  </span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Harmless
                  </span>
                </div>
              </div>

              {/* Conic circular ratio chart */}
              <VirusTotalRatioChart
                malicious={scan.externalIntel.maliciousCount}
                suspicious={scan.externalIntel.suspiciousCount}
                harmless={scan.externalIntel.harmlessCount}
              />
            </div>
          </div>

          {/* Community Intelligence Consensus */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-0 flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-[#30363D] bg-[#0C0E12] flex items-center space-x-2">
              <Icon name="groups" className="text-primary-fixed text-xl" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Community Intelligence Consensus
              </h3>
            </div>

            <div className="p-6 space-y-3 flex-1">
              {scan.communityIntel.map((ci, idx) => (
                <div
                  key={`${ci.type}-${idx}`}
                  className="bg-[#0C0E12] p-3.5 rounded border border-outline-variant flex justify-between items-center group hover:border-primary/50 transition-colors"
                >
                  <div className="overflow-hidden mr-3">
                    <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-0.5">
                      {ci.type}
                    </p>
                    <p className="font-code-sm text-xs text-on-surface truncate max-w-[220px] sm:max-w-[280px]">
                      {ci.target}
                    </p>
                  </div>
                  <div
                    className={`flex items-center space-x-2 px-2.5 py-1 rounded border shrink-0 ${
                      ci.severity === "critical"
                        ? "bg-error/10 text-error border-error/20"
                        : ci.severity === "high"
                        ? "bg-tertiary-container/10 text-tertiary-container border-tertiary-container/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}
                  >
                    <Icon name={ci.severity === "safe" ? "check" : "flag"} className="text-xs" />
                    <span className="font-code-sm text-xs font-bold">
                      {ci.reportCount} Reports
                    </span>
                  </div>
                </div>
              ))}

              {/* Pipeline Timing Telemetry if available from real backend */}
              {scan.timing && (
                <div className="mt-3 pt-3 border-t border-surface-variant/30 flex flex-wrap items-center justify-between text-[11px] font-code-sm text-on-surface-variant">
                  <span>
                    LLM: <strong className="text-on-surface">{scan.timing.llm_ms ? `${(scan.timing.llm_ms / 1000).toFixed(2)}s` : "--"}</strong>
                  </span>
                  <span>
                    VT: <strong className="text-on-surface">{scan.timing.virustotal_ms ? `${(scan.timing.virustotal_ms).toFixed(0)}ms` : "--"}</strong>
                  </span>
                  <span>
                    Total Pipeline: <strong className="text-primary">{scan.timing.pipeline_total_ms ? `${(scan.timing.pipeline_total_ms / 1000).toFixed(2)}s` : "--"}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
