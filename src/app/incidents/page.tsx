"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { incidentService } from "@/services/incidentService";
import { IncidentDetail, IncidentItem, IncidentKpis } from "@/types/incident";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SlideOver } from "@/components/ui/SlideOver";

export default function IncidentCenterPage() {
  const [kpis, setKpis] = useState<IncidentKpis | null>(null);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentDetail | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [kpiData, items] = await Promise.all([
          incidentService.getKpis(),
          incidentService.getIncidents(),
        ]);
        setKpis(kpiData);
        setIncidents(items);
        // Default open the first incident on desktop for instant demo
        const detail = await incidentService.getIncidentById(items[0]?.id || "INC-4092");
        setSelectedIncident(detail);
      } catch (err) {
        console.error("Failed to load incidents", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectIncident = async (id: string) => {
    try {
      const detail = await incidentService.getIncidentById(id);
      setSelectedIncident(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async () => {
    if (!selectedIncident) return;
    await incidentService.updateIncidentStatus(selectedIncident.id, "resolved");
    setSelectedIncident({ ...selectedIncident, status: "resolved" });
    setIncidents((prev) =>
      prev.map((i) => (i.id === selectedIncident.id ? { ...i, status: "resolved" } : i))
    );
  };

  const filteredIncidents = incidents.filter((i) => {
    const matchSearch =
      !search ||
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.threatType.toLowerCase().includes(search.toLowerCase()) ||
      i.platform.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || i.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-stack-lg max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            Incident Center
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Real-time threat triage, IOC response coordination, and SOC evidence auditing.
          </p>
        </div>
        <Link href="/scan/new">
          <Button variant="primary" size="md" icon="add">
            New Scan
          </Button>
        </Link>
      </header>

      {/* Summary KPI Cards (Bento Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Incidents */}
        <Card className="p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Total Incidents
            </span>
            <Icon name="list_alt" className="text-primary text-xl" />
          </div>
          <div className="font-display-lg text-display-lg text-on-surface z-10">
            {kpis?.total || 42}
          </div>
          <div className="flex items-center gap-1 text-xs text-primary z-10 font-code-sm">
            <Icon name="trending_up" className="text-[14px]" />
            +{kpis?.weeklyChangePercent || 12}%{" "}
            <span className="text-on-surface-variant ml-1">vs last week</span>
          </div>
        </Card>

        {/* Critical */}
        <Card className="p-5 flex flex-col gap-3 relative overflow-hidden group border-error/40 shadow-[0_0_15px_rgba(255,180,171,0.08)]">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-caps text-label-caps text-error uppercase tracking-wider font-bold">
              Critical
            </span>
            <Icon name="warning" className="text-error text-xl" />
          </div>
          <div className="font-display-lg text-display-lg text-error z-10 font-bold">
            {kpis?.critical || 8}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-error z-10 font-code-sm font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            Action Required
          </div>
        </Card>

        {/* Investigating */}
        <Card className="p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Investigating
            </span>
            <Icon name="search" className="text-tertiary text-xl" />
          </div>
          <div className="font-display-lg text-display-lg text-on-surface z-10">
            {kpis?.investigating || 15}
          </div>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant z-10 font-code-sm">
            Active Triage
          </div>
        </Card>

        {/* Resolved */}
        <Card className="p-5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Resolved
            </span>
            <Icon name="check_circle" className="text-secondary text-xl" />
          </div>
          <div className="font-display-lg text-display-lg text-on-surface z-10">
            {kpis?.resolved || 19}
          </div>
          <div className="flex items-center gap-1 text-xs text-primary z-10 font-code-sm">
            <Icon name="trending_up" className="text-[14px]" />
            +{kpis?.resolutionRateChangePercent || 5}%{" "}
            <span className="text-on-surface-variant ml-1">close rate</span>
          </div>
        </Card>
      </div>

      {/* Main Workspace (Table + SlideOver Detail Panel) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Panel */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between bg-[#161B22] border border-[#30363D] rounded-lg p-2.5 gap-3">
            <div className="flex items-center gap-2 px-2">
              <Icon name="filter_list" className="text-on-surface-variant text-sm" />
              <span className="font-label-caps text-xs text-on-surface-variant uppercase">
                Filter:
              </span>
            </div>

            <div className="flex gap-2">
              {(["all", "open", "investigating", "resolved"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-code-sm rounded transition-colors uppercase ${
                    statusFilter === st
                      ? "bg-surface-container-high border border-primary/50 text-primary font-bold"
                      : "border border-[#30363D] text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative ml-auto w-full sm:w-64">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm"
              />
              <input
                type="text"
                placeholder="Search ID or Keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0A0C10] border border-[#30363D] rounded py-1.5 pl-9 pr-3 text-sm font-code-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Incident Table */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#30363D] bg-surface-container-highest/20">
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-medium">
                      Incident ID
                    </th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-medium">
                      Timestamp
                    </th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-medium">
                      Threat Type
                    </th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-medium">
                      Platform
                    </th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-medium">
                      Severity
                    </th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body-sm divide-y divide-[#30363D]/30">
                  {filteredIncidents.map((inc) => {
                    const isSelected = selectedIncident?.id === inc.id;
                    return (
                      <tr
                        key={inc.id}
                        onClick={() => handleSelectIncident(inc.id)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? "bg-primary/10 border-l-2 border-primary"
                            : "hover:bg-[#1C2128]"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-code-sm text-primary font-bold group-hover:underline">
                          {inc.id}
                        </td>
                        <td className="py-3.5 px-4 font-code-sm text-xs text-on-surface-variant whitespace-nowrap">
                          {inc.timestamp}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface font-medium text-xs sm:text-sm">
                          {inc.threatType}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant font-code-sm text-xs">
                          {inc.platform}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={inc.severity} glow={inc.severity === "critical"}>
                            {inc.severity}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={inc.status}>{inc.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Slide-over Triage Drawer (Right Side) */}
        {selectedIncident && (
          <SlideOver
            isOpen={!!selectedIncident}
            onClose={() => setSelectedIncident(null)}
            title={selectedIncident.threatType}
            badge={
              <div className="flex items-center gap-2">
                <span className="font-code-sm text-primary text-sm font-bold">
                  {selectedIncident.id}
                </span>
                <Badge variant={selectedIncident.severity} glow={true}>
                  {selectedIncident.severity.toUpperCase()}
                </Badge>
              </div>
            }
            footer={
              <div className="flex gap-3">
                <button className="flex-1 bg-transparent border border-[#30363D] hover:bg-surface-container-highest text-on-surface font-medium py-2 px-4 rounded text-xs transition-colors">
                  Escalate Tier 3
                </button>
                <button
                  onClick={handleResolve}
                  className="flex-1 bg-primary hover:bg-primary-fixed text-on-primary font-bold py-2 px-4 rounded text-xs transition-colors shadow-[0_0_10px_rgba(111,221,120,0.2)]"
                >
                  Mark Resolved
                </button>
              </div>
            }
          >
            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm bg-[#0A0C10] p-3 rounded border border-[#30363D]">
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-0.5">
                  Status
                </p>
                <p className="text-tertiary font-medium capitalize text-xs">
                  {selectedIncident.status}
                </p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-0.5">
                  Detected Time
                </p>
                <p className="font-code-sm text-xs text-on-surface">{selectedIncident.timestamp}</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-0.5">
                  Platform
                </p>
                <div className="flex items-center gap-1.5 text-xs text-on-surface">
                  <Icon name="send" className="text-sm text-on-surface-variant" />
                  {selectedIncident.platform}
                </div>
              </div>
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-0.5">
                  Assigned Analyst
                </p>
                <p className="text-on-surface text-xs font-semibold">
                  {selectedIncident.analyst || "SOC Team Alpha"}
                </p>
              </div>
            </div>

            {/* Risk Overview */}
            <div>
              <h4 className="font-label-caps text-xs text-on-surface-variant uppercase border-b border-[#30363D] pb-1.5 mb-2">
                Risk Overview
              </h4>
              <p className="text-xs text-on-surface/90 leading-relaxed">
                {selectedIncident.riskOverview || selectedIncident.description}
              </p>
            </div>

            {/* Evidence Artifacts */}
            <div>
              <h4 className="font-label-caps text-xs text-on-surface-variant uppercase border-b border-[#30363D] pb-1.5 mb-3 flex justify-between items-center">
                Evidence Artifacts
                <span className="text-[10px] bg-[#30363D] px-1.5 rounded">
                  {selectedIncident.evidenceArtifacts?.length || 3} Files
                </span>
              </h4>
              <div className="space-y-2">
                {selectedIncident.evidenceArtifacts?.map((art) => (
                  <div
                    key={art.id}
                    className="flex items-center gap-3 bg-[#0A0C10] p-2 rounded border border-[#30363D] hover:border-primary/50 cursor-pointer transition-colors"
                  >
                    <Icon name="code" className="text-primary/70 text-lg" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-code-sm text-on-surface truncate">{art.name}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {art.type} • {art.size}
                      </p>
                    </div>
                    <Icon name={art.actionIcon} className="text-sm text-on-surface-variant" />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <h4 className="font-label-caps text-xs text-on-surface-variant uppercase border-b border-[#30363D] pb-1.5 mb-2">
                AI Recommendations
              </h4>
              <ul className="space-y-2 text-xs">
                {selectedIncident.aiRecommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#0A0C10]/60 p-2 rounded border border-outline-variant/30">
                    <Icon name="check" className="text-primary text-[14px] mt-0.5 shrink-0" />
                    <span className="text-on-surface/90 leading-normal">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SlideOver>
        )}
      </div>
    </div>
  );
}
