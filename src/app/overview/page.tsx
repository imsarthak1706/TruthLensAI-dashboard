"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { scanService } from "@/services/scanService";
import { analyticsService } from "@/services/analyticsService";
import { OverviewKpis, ScanItem, SeverityDistributionData } from "@/types/scan";
import { ModalityLatency } from "@/types/analytics";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ThreatActivityChart } from "@/components/charts/ThreatActivityChart";
import { SeverityDonutChart } from "@/components/charts/SeverityDonutChart";
import { LatencyBarsChart } from "@/components/charts/LatencyBarsChart";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function OverviewPage() {
  const [kpis, setKpis] = useState<OverviewKpis | null>(null);
  const [severityData, setSeverityData] = useState<SeverityDistributionData | null>(null);
  const [recentScans, setRecentScans] = useState<ScanItem[]>([]);
  const [latencyData, setLatencyData] = useState<ModalityLatency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [kpiRes, sevRes, scansRes, latencyRes] = await Promise.all([
          scanService.getOverviewKpis(),
          scanService.getSeverityDistribution(),
          scanService.getRecentScans(5),
          analyticsService.getModalityLatency(),
        ]);
        setKpis(kpiRes);
        setSeverityData(sevRes);
        setRecentScans(scansRes);
        setLatencyData(latencyRes);
      } catch (err) {
        console.error("Failed to load overview data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-stack-lg">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            TruthLensAI Security Overview
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Multimodal threat detection metrics, SOC queue status, and community telemetry.
          </p>
        </div>
        <Link href="/scan/new">
          <button className="bg-primary hover:bg-primary-fixed text-on-primary-fixed font-label-caps text-xs uppercase font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(111,221,120,0.2)]">
            <Icon name="security" className="text-sm" /> Analyze Content
          </button>
        </Link>
      </header>

      {/* KPI Row (6 Bento Cards - Aligned with centralized mock service) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter">
        {/* Total Scans */}
        <Card className="p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Total Scans
          </span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {kpis?.totalScansLabel || "12.4k"}
            </span>
            <span className="text-primary text-xs flex items-center font-code-sm">
              <Icon name="trending_up" className="text-[14px] mr-0.5" />
              {kpis?.totalScansTrend || "+12%"}
            </span>
          </div>
        </Card>

        {/* Threats Detected */}
        <Card className="p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 text-error/30">
            <Icon name="warning" className="text-xl" />
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Threats Detected
          </span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-display-lg text-display-lg text-error font-bold">
              {kpis?.threatsDetected || 842}
            </span>
            <span className="text-error text-xs flex items-center font-code-sm">
              <Icon name="trending_up" className="text-[14px] mr-0.5" />
              {kpis?.threatsTrend || "+4%"}
            </span>
          </div>
        </Card>

        {/* Critical Threats */}
        <Card
          level={1}
          className="p-4 flex flex-col justify-between h-28 relative overflow-hidden border-l-2 border-l-error shadow-[0_0_20px_rgba(255,180,171,0.08)]"
        >
          <span className="font-label-caps text-label-caps text-error uppercase tracking-wider flex items-center gap-1">
            <Icon name="emergency" fill={true} className="text-[14px]" /> Critical Threats
          </span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-display-lg text-display-lg text-error font-bold">
              {kpis?.criticalThreats || 24}
            </span>
            <span className="text-on-surface-variant text-xs flex items-center font-code-sm">
              <Icon name="trending_down" className="text-[14px] mr-0.5 text-primary" />
              {kpis?.criticalThreatsTrend || "-2"}
            </span>
          </div>
        </Card>

        {/* Community Reports */}
        <Card className="p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Community Reports
          </span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {kpis?.communityReportsLabel || "1.2k"}
            </span>
            <span className="text-primary text-xs flex items-center font-code-sm">
              <Icon name="trending_up" className="text-[14px] mr-0.5" />
              {kpis?.communityReportsTrend || "+18%"}
            </span>
          </div>
        </Card>

        {/* Detection Confidence */}
        <Card className="p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Detection Confidence
          </span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-display-lg text-display-lg text-primary font-bold">
              {kpis?.detectionConfidence || 98.2}
              <span className="text-2xl">%</span>
            </span>
          </div>
        </Card>

        {/* Avg Response Time */}
        <Card className="p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Avg Response Time
          </span>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {kpis?.avgResponseTime || "2.8s"}
            </span>
            <span className="text-primary text-xs flex items-center font-code-sm">
              <Icon name="trending_down" className="text-[14px] mr-0.5" />
              {kpis?.avgResponseTimeTrend || "-0.2s"}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        {/* Threat Activity Area Chart (Spans 8 cols) */}
        <div className="xl:col-span-8 bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <ThreatActivityChart />
        </div>

        {/* Secondary Visualizations (Spans 4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-gutter">
          {/* 4-Tier Severity Donut */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex-1">
            <SeverityDonutChart data={severityData || undefined} />
          </div>

          {/* Benchmark Processing Latency Bars */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex-1">
            <LatencyBarsChart items={latencyData} title="Benchmark Latency by Modality" />
          </div>
        </div>
      </div>

      {/* Tables & Panels Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Recent Scans Table (Spans 8 cols) */}
        <div className="lg:col-span-8 bg-[#161B22] border border-[#30363D] rounded-lg flex flex-col">
          <div className="p-4 border-b border-[#30363D] flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Recent Scans
            </h3>
            <Link
              href="/history"
              className="font-label-caps text-label-caps text-primary hover:text-primary-fixed uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              View All <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#30363D] text-on-surface-variant font-label-caps text-label-caps uppercase bg-[#0C0E12]/50">
                  <th className="py-3 px-4 font-medium">Time</th>
                  <th className="py-3 px-4 font-medium">Target Input</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Risk Score</th>
                  <th className="py-3 px-4 font-medium">Severity</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="font-code-sm text-code-sm divide-y divide-[#30363D]/30">
                {recentScans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-[#1C2128] transition-colors group cursor-pointer"
                  >
                    <td className="py-2.5 px-4 text-on-surface-variant font-code-sm">
                      {scan.timestamp}
                    </td>
                    <td className="py-2.5 px-4 text-on-surface truncate max-w-[200px] font-code-sm">
                      <Link href={`/scan/${scan.id}`} className="hover:text-primary transition-colors">
                        {scan.targetInput}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 text-on-surface-variant uppercase text-xs">
                      {scan.modality}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10">
                          <ProgressBar
                            value={scan.riskScore}
                            colorClass={
                              scan.riskScore > 75
                                ? "bg-error"
                                : scan.riskScore > 40
                                ? "bg-tertiary-container"
                                : "bg-primary"
                            }
                          />
                        </div>
                        <span
                          className={
                            scan.riskScore > 75
                              ? "text-error"
                              : scan.riskScore > 40
                              ? "text-tertiary-container"
                              : "text-primary"
                          }
                        >
                          {scan.riskScore < 10 ? `0${scan.riskScore}` : scan.riskScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant={scan.severity} glow={scan.severity === "critical"}>
                        {scan.severity}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-primary flex items-center gap-1 font-label-caps text-xs">
                      <Icon name="check_circle" className="text-sm" /> Complete
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incidents & Community Side Panels (Spans 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Actionable Incidents Panel */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
                <Icon name="report_problem" className="text-error text-lg" /> Actionable Incidents
              </h3>
              <Link href="/incidents" className="text-xs text-primary font-label-caps uppercase hover:underline">
                Manage
              </Link>
            </div>
            <div className="space-y-3">
              <Link href="/incidents">
                <div className="p-3 bg-[#1C2128] border border-[#30363D] rounded hover:border-outline-variant transition-colors cursor-pointer mb-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-code-sm text-code-sm text-error font-bold">INC-8492</span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant">2m ago</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface mb-2 leading-tight">
                    Coordinated Phishing Campaign detected targeting Financial sector templates.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="critical">Critical</Badge>
                    <Badge variant="open">Open</Badge>
                  </div>
                </div>
              </Link>

              <Link href="/incidents">
                <div className="p-3 bg-[#1C2128] border border-[#30363D] rounded hover:border-outline-variant transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-code-sm text-code-sm text-tertiary-container font-bold">INC-8491</span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant">15m ago</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface mb-2 leading-tight">
                    Spike in malicious smart contract deployments on ETH mainnet.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="high">High</Badge>
                    <Badge variant="investigating">Investigating</Badge>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Community Intel Consensus Panel */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex-1">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-4 flex items-center gap-2">
              <Icon name="public" className="text-primary text-lg" /> Community Intelligence
            </h3>
            <div className="p-3 bg-[#0A0C10] border border-outline-variant/50 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="language" className="text-on-surface-variant text-sm" />
                <span className="font-code-sm text-code-sm text-on-surface truncate">
                  amazon-account-verify.xyz
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="block font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">
                    Reputation Consensus
                  </span>
                  <Badge variant="high">High Risk</Badge>
                </div>
                <div className="text-right">
                  <span className="block font-display-lg text-2xl font-bold text-on-surface">15</span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Reports / 24h
                  </span>
                </div>
              </div>
            </div>
            <Link href="/community">
              <button className="w-full mt-3 py-2 border border-[#30363D] rounded text-on-surface-variant hover:text-on-surface hover:bg-[#1C2128] transition-colors font-label-caps text-label-caps uppercase text-center text-xs">
                View Global Feed
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
