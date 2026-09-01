"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { scanService } from "@/services/scanService";
import { analyticsService } from "@/services/analyticsService";
import { incidentService } from "@/services/incidentService";
import { OverviewKpis, ScanItem, SeverityDistributionData } from "@/types/scan";
import { ModalityLatency } from "@/types/analytics";
import { IncidentItem } from "@/types/incident";
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
  const [activeIncidents, setActiveIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [kpiRes, sevRes, scansRes, latencyRes, incidentsRes] = await Promise.all([
          scanService.getOverviewKpis(),
          scanService.getSeverityDistribution(),
          scanService.getRecentScans(5),
          analyticsService.getModalityLatency(),
          incidentService.getIncidents(),
        ]);
        setKpis(kpiRes);
        setSeverityData(sevRes);
        setRecentScans(scansRes);
        setLatencyData(latencyRes);
        // Display active (non-resolved) incidents
        setActiveIncidents(incidentsRes.filter((i) => i.status !== "resolved").slice(0, 3));
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
            Multimodal threat detection metrics, SOC queue status, and telemetry overview.
          </p>
        </div>
        <Link href="/scan/new">
          <button className="bg-primary hover:bg-primary-fixed text-on-primary-fixed font-label-caps text-xs uppercase font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(111,221,120,0.2)]">
            <Icon name="security" className="text-sm" /> Analyze Content
          </button>
        </Link>
      </header>

      {/* KPI Row (6 Bento Cards - Real Metrics & Honest Empty States) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter">
        {/* Total Scans */}
        <Card className="p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Total Scans
          </span>
          <div className="flex flex-col mt-auto">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {loading ? "..." : (kpis?.totalScans ?? 0)}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {loading ? "Loading..." : kpis ? "Indexed Scans" : "Telemetry unavailable"}
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
          <div className="flex flex-col mt-auto">
            <span className="font-display-lg text-display-lg text-error font-bold">
              {loading ? "..." : (kpis?.threatsDetected ?? 0)}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              Risk Score ≥ 40
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
          <div className="flex flex-col mt-auto">
            <span className="font-display-lg text-display-lg text-error font-bold">
              {loading ? "..." : (kpis?.criticalThreats ?? 0)}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              Immediate Triage
            </span>
          </div>
        </Card>

        {/* Community Reports */}
        <Card className="p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Community Reports
          </span>
          <div className="flex flex-col mt-auto">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {loading ? "..." : (kpis?.communityReports ?? 0)}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              Indexed Indicators
            </span>
          </div>
        </Card>

        {/* Detection Confidence */}
        <Card className="p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Detection Confidence
          </span>
          <div className="flex flex-col mt-auto">
            <span className="font-display-lg text-2xl text-on-surface-variant/80 font-bold">
              N/A
            </span>
            <span className="text-[10px] font-code-sm text-on-surface-variant/70 truncate">
              No aggregate telemetry
            </span>
          </div>
        </Card>

        {/* Avg Response Time */}
        <Card className="p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Avg Response Time
          </span>
          <div className="flex flex-col mt-auto">
            <span className="font-display-lg text-2xl text-on-surface-variant/80 font-bold">
              N/A
            </span>
            <span className="text-[10px] font-code-sm text-on-surface-variant/70 truncate">
              No aggregate telemetry
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
                {recentScans.length > 0 ? (
                  recentScans.map((scan) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 px-4 text-center">
                      <div className="space-y-1 text-on-surface-variant max-w-sm mx-auto">
                        <Icon name="search_off" className="text-3xl mx-auto opacity-40 mb-1" />
                        <p className="font-code-sm text-xs text-on-surface font-semibold">
                          No recent scans recorded
                        </p>
                        <p className="text-[11px] font-code-sm text-on-surface-variant/70">
                          Analyze content in the Multimodal Threat Scanner to generate forensic records.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incidents & Community Side Panels (Spans 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Actionable Incidents Panel */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
                <Icon name="report_problem" className="text-error text-lg" /> Actionable Incidents
              </h3>
              <Link href="/incidents" className="text-xs text-primary font-label-caps uppercase hover:underline">
                Manage
              </Link>
            </div>

            {activeIncidents.length > 0 ? (
              <div className="space-y-2.5">
                {activeIncidents.map((inc) => (
                  <Link key={inc.id} href={`/incidents?selectedId=${inc.id}`}>
                    <div className="p-3 bg-[#1C2128] border border-[#30363D] rounded hover:border-outline-variant transition-colors cursor-pointer mb-2 last:mb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-code-sm text-code-sm font-bold ${inc.severity === "critical" ? "text-error" : "text-tertiary-container"}`}>
                          {inc.id}
                        </span>
                        <span className="font-label-caps text-[10px] text-on-surface-variant truncate max-w-[90px]">
                          {inc.timestamp}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface mb-2 leading-tight line-clamp-2">
                        {inc.threatType || inc.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant={inc.severity}>{inc.severity}</Badge>
                        <Badge variant={inc.status}>{inc.status}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 px-4 rounded border border-dashed border-outline-variant/40 bg-[#0C0E12] text-center space-y-1.5 my-auto">
                <Icon name="check_circle" className="text-primary text-2xl mx-auto opacity-60" />
                <p className="font-code-sm text-xs font-semibold text-on-surface">No active incidents</p>
                <p className="text-[11px] font-code-sm text-on-surface-variant/70 max-w-xs mx-auto">
                  All reported threat telemetry is currently resolved or awaiting incident creation.
                </p>
              </div>
            )}
          </div>

          {/* Community Intel Consensus Panel */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
                <Icon name="public" className="text-primary text-lg" /> Community Intelligence
              </h3>
              <Link href="/community" className="text-xs text-primary font-label-caps uppercase hover:underline">
                Feed
              </Link>
            </div>

            <div className="py-6 px-4 rounded border border-dashed border-outline-variant/40 bg-[#0A0C10] text-center space-y-1.5 my-auto">
              <Icon name="public_off" className="text-on-surface-variant text-2xl mx-auto opacity-50" />
              <p className="font-code-sm text-xs font-semibold text-on-surface">
                Community telemetry unavailable
              </p>
              <p className="text-[11px] font-code-sm text-on-surface-variant/70 max-w-xs mx-auto">
                Decentralized indicator consensus feed not yet connected to live telemetry stream.
              </p>
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
