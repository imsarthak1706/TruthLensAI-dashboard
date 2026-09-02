"use client";

import React, { useEffect, useState } from "react";
import { communityService } from "@/services/communityService";
import { CommunityIndicator } from "@/types/community";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { exportIndicatorAsStix } from "@/lib/stixExporter";

export default function CommunityIntelligencePage() {
  const [indicators, setIndicators] = useState<CommunityIndicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<CommunityIndicator | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stixStatus, setStixStatus] = useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await communityService.getIndicators();
      setIndicators(list);
      if (list.length > 0) {
        setSelectedIndicator(list[0]);
      } else {
        setSelectedIndicator(null);
      }
    } catch (err) {
      console.error("Failed to load community intelligence", err);
      setError("Community telemetry unavailable");
      setIndicators([]);
      setSelectedIndicator(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredIndicators = React.useMemo(() => {
    if (!search.trim()) return indicators;
    const q = search.toLowerCase();
    return indicators.filter(
      (item) =>
        item.indicator.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.risk.toLowerCase().includes(q)
    );
  }, [indicators, search]);

  const totalReports = React.useMemo(() => {
    return indicators.reduce((acc, i) => acc + (i.reportsCount || 0), 0);
  }, [indicators]);

  const urlCount = React.useMemo(() => {
    return indicators.filter((i) => i.type === "URL").length;
  }, [indicators]);

  const domainCount = React.useMemo(() => {
    return indicators.filter((i) => i.type === "Domain").length;
  }, [indicators]);

  const criticalCount = React.useMemo(() => {
    return indicators.filter((i) => i.risk === "Critical").length;
  }, [indicators]);

  const handleExportStix = () => {
    if (!selectedIndicator) {
      setStixStatus("Select an indicator first");
      setTimeout(() => setStixStatus(null), 2500);
      return;
    }
    try {
      exportIndicatorAsStix(selectedIndicator);
      setStixStatus("STIX 2.1 exported");
      setTimeout(() => setStixStatus(null), 2500);
    } catch (err) {
      console.error("Failed to export STIX bundle", err);
      setStixStatus("Export failed");
      setTimeout(() => setStixStatus(null), 2500);
    }
  };

  return (
    <div className="space-y-stack-lg max-w-7xl mx-auto">
      {/* Page Header */}
      <header>
        <h1 className="font-headline-md text-headline-md font-bold mb-1 text-on-surface">
          Community Intelligence Database
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Collective threat reputation &amp; IOC signature database reported across nodes.
        </p>
      </header>

      {/* Global Search */}
      <div className="relative max-w-3xl">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
          <Icon name="search" className="text-xl" />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0A0C10] border border-[#30363D] rounded-lg py-3 pl-12 pr-4 text-on-surface font-code-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50"
          placeholder="Search URL, domain, or threat risk tier..."
          type="text"
        />
      </div>

      {/* Summary KPI Cards (Derived from Live Indicators) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-gutter">
        <Card className="p-4 flex flex-col justify-between h-24">
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Total Indicators
          </div>
          <div className="flex flex-col mt-auto">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {loading ? "..." : indicators.length}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {indicators.length > 0 ? "Indexed IOCs" : "No live community telemetry"}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between h-24">
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            URL Targets
          </div>
          <div className="flex flex-col mt-auto">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {loading ? "..." : urlCount}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {indicators.length > 0 ? "HTTP/HTTPS Targets" : "No live community telemetry"}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between h-24">
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Domain Targets
          </div>
          <div className="flex flex-col mt-auto">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {loading ? "..." : domainCount}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {indicators.length > 0 ? "Reputation Records" : "No live community telemetry"}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between h-24">
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Consensus Reports
          </div>
          <div className="flex flex-col mt-auto">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {loading ? "..." : totalReports}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {indicators.length > 0 ? "Verified Submissions" : "No live community telemetry"}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between h-24 border-l-2 border-l-error">
          <div className="font-label-caps text-label-caps text-error uppercase tracking-wider flex items-center gap-1">
            <Icon name="emergency" fill={true} className="text-[14px]" /> Critical Threats
          </div>
          <div className="flex flex-col mt-auto">
            <span className="font-headline-sm text-headline-sm font-bold text-error">
              {loading ? "..." : criticalCount}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {indicators.length > 0 ? "Immediate Priority" : "No live community telemetry"}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Left Area (Table), Right Area (Detail Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Left 2 Cols: Table */}
        <div className="lg:col-span-2 space-y-stack-md">
          {/* Intelligence Table */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-[#30363D] flex justify-between items-center bg-[#161B22]">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                Indexed Indicators ({filteredIndicators.length})
              </h3>
              <span className="text-primary font-body-sm text-[12px] flex items-center font-code-sm gap-1">
                <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" /> Live Telemetry Feed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#30363D] bg-[#0A0C10]/60">
                    <th className="p-3 font-label-caps text-label-caps text-on-surface-variant font-normal">
                      Indicator
                    </th>
                    <th className="p-3 font-label-caps text-label-caps text-on-surface-variant font-normal">
                      Type
                    </th>
                    <th className="p-3 font-label-caps text-label-caps text-on-surface-variant font-normal">
                      Reports
                    </th>
                    <th className="p-3 font-label-caps text-label-caps text-on-surface-variant font-normal">
                      First Seen
                    </th>
                    <th className="p-3 font-label-caps text-label-caps text-on-surface-variant font-normal">
                      Last Seen
                    </th>
                    <th className="p-3 font-label-caps text-label-caps text-on-surface-variant font-normal">
                      Risk
                    </th>
                  </tr>
                </thead>
                <tbody className="font-code-sm text-code-sm text-on-surface divide-y divide-[#30363D]/30">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-on-surface-variant font-code-sm">
                        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mr-2" />
                        Loading community telemetry...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-on-surface-variant font-code-sm">
                        <div className="space-y-2 max-w-sm mx-auto">
                          <Icon name="error_outline" className="text-error text-3xl mx-auto opacity-70" />
                          <p className="font-code-sm text-sm text-error font-semibold">
                            Community telemetry unavailable
                          </p>
                          <p className="text-xs text-on-surface-variant/70">
                            Unable to connect to the decentralized consensus feed.
                          </p>
                          <button
                            onClick={() => loadData()}
                            className="mt-2 px-3 py-1.5 bg-[#1C2128] border border-[#30363D] hover:border-outline-variant text-on-surface rounded text-xs font-label-caps uppercase transition-colors"
                          >
                            Retry Connection
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredIndicators.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-on-surface-variant font-code-sm">
                        <div className="space-y-1 max-w-sm mx-auto">
                          <Icon name="public_off" className="text-3xl mx-auto opacity-40 mb-1" />
                          <p className="font-code-sm text-xs text-on-surface font-semibold">
                            {search ? "No matching indicators found" : "No community indicators indexed"}
                          </p>
                          <p className="text-[11px] font-code-sm text-on-surface-variant/70">
                            {search
                              ? "Try adjusting your search terms."
                              : "Telemetry reported by threat nodes will appear here in real time."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredIndicators.map((item) => {
                      const isSelected = selectedIndicator?.id === item.id;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedIndicator(item)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? "bg-[#1C2128] border-l-2 border-primary" : "hover:bg-[#1C2128]"
                          }`}
                        >
                          <td className="p-3 text-primary truncate max-w-[200px]" title={item.indicator}>
                            {item.indicator}
                          </td>
                          <td className="p-3 text-on-surface-variant uppercase text-xs">{item.type}</td>
                          <td className="p-3 font-bold text-on-surface">{item.reportsCount}</td>
                          <td className="p-3 text-on-surface-variant text-xs">{item.firstSeen}</td>
                          <td className="p-3 text-on-surface-variant text-xs">{item.lastSeen || item.firstSeen}</td>
                          <td className="p-3">
                            <Badge variant={item.risk.toLowerCase()} glow={item.risk === "Critical"}>
                              {item.risk}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Detail Sidebar/Panel */}
        <div className="lg:col-span-1">
          {selectedIndicator ? (
            <Card className="h-full p-5 flex flex-col relative overflow-hidden">
              {/* Top decorative glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-error to-transparent opacity-60" />

              <div className="flex justify-between items-start mb-6 mt-1">
                <div>
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">
                    {selectedIndicator.type} Target
                  </div>
                  <div className="font-code-sm text-base text-error break-all font-semibold">
                    {selectedIndicator.indicator}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#0A0C10] p-3 rounded border border-[#30363D]">
                  <div className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">
                    Reputation Status
                  </div>
                  <div className="font-body-sm font-semibold text-error flex items-center text-xs">
                    <Icon name="warning" className="text-[16px] mr-1" />
                    {selectedIndicator.status}
                  </div>
                </div>
                <div className="bg-[#0A0C10] p-3 rounded border border-[#30363D]">
                  <div className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">
                    Total Reports
                  </div>
                  <div className="font-body-sm font-bold text-on-surface text-sm">
                    {selectedIndicator.reportsCount} Nodes
                  </div>
                </div>
              </div>

              {/* Observed Timestamps */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#0A0C10] p-3 rounded border border-[#30363D]">
                  <div className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">
                    First Seen
                  </div>
                  <div className="font-code-sm text-xs text-on-surface">
                    {selectedIndicator.firstSeen || "Recently"}
                  </div>
                </div>
                <div className="bg-[#0A0C10] p-3 rounded border border-[#30363D]">
                  <div className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">
                    Last Seen
                  </div>
                  <div className="font-code-sm text-xs text-on-surface">
                    {selectedIndicator.lastSeen || selectedIndicator.firstSeen || "Recently"}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-6 flex-1">
                <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-3">
                  Indicator Telemetry Timeline
                </h4>
                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[7px] before:w-[1px] before:bg-[#30363D]">
                  <div className="relative pl-6">
                    <span className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-[#161B22] border-2 border-primary z-10" />
                    <div className="font-code-sm text-[11px] text-on-surface-variant mb-0.5">
                      {selectedIndicator.firstSeen}
                    </div>
                    <div className="font-body-sm text-xs text-on-surface font-medium">
                      Initial Observation
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Threat signature indexed in decentralized reputation view.
                    </p>
                  </div>
                  {selectedIndicator.lastSeen && selectedIndicator.lastSeen !== selectedIndicator.firstSeen && (
                    <div className="relative pl-6">
                      <span
                        className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-[#161B22] border-2 ${
                          selectedIndicator.risk === "Critical"
                            ? "border-error shadow-[0_0_8px_rgba(255,180,171,0.4)]"
                            : "border-tertiary-container"
                        } z-10`}
                      />
                      <div className="font-code-sm text-[11px] text-on-surface-variant mb-0.5">
                        {selectedIndicator.lastSeen}
                      </div>
                      <div className="font-body-sm text-xs text-on-surface font-medium">
                        Latest Consensus Update
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Confirmed {selectedIndicator.reportsCount} cumulative community detections.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-4 border-t border-[#30363D]">
                <h4 className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">
                  SOC Response Actions
                </h4>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-surface-container-high border border-[#30363D] hover:bg-surface-container-highest text-on-surface font-body-sm text-xs py-2 rounded transition-colors flex justify-center items-center gap-1">
                    <Icon name="block" className="text-sm" /> Block IOC
                  </button>
                  <button
                    onClick={handleExportStix}
                    className="flex-1 bg-surface-container-high border border-[#30363D] hover:bg-surface-container-highest text-on-surface font-body-sm text-xs py-2 rounded transition-colors flex justify-center items-center gap-1"
                    title="Export STIX 2.1 Bundle"
                  >
                    <Icon name={stixStatus === "STIX 2.1 exported" ? "check" : "download"} className="text-sm" />
                    <span>{stixStatus === "STIX 2.1 exported" ? "STIX 2.1 Exported" : "Export STIX"}</span>
                  </button>
                </div>
                {stixStatus && (
                  <p
                    className={`text-[11px] font-code-sm text-center mt-2 animate-in fade-in duration-150 ${
                      stixStatus.includes("failed") || stixStatus.includes("Select")
                        ? "text-error"
                        : "text-primary"
                    }`}
                  >
                    {stixStatus === "STIX 2.1 exported" ? "✓ STIX 2.1 JSON bundle downloaded" : stixStatus}
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <Card className="h-full p-6 flex flex-col items-center justify-center text-center border border-dashed border-[#30363D] bg-[#0A0C10]">
              <Icon name="radar" className="text-on-surface-variant text-3xl opacity-40 mb-2" />
              <p className="font-code-sm text-xs font-semibold text-on-surface">
                {loading ? "Loading community telemetry..." : "No indicator selected"}
              </p>
              <p className="font-code-sm text-[11px] text-on-surface-variant/70 max-w-xs mt-1">
                Select an indexed threat indicator from the community feed to view consensus details.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
