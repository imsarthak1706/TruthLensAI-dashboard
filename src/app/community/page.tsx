"use client";

import React, { useEffect, useState } from "react";
import { communityService } from "@/services/communityService";
import { CommunityIndicator, CommunityKpis } from "@/types/community";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CommunityActivityChart } from "@/components/charts/CommunityActivityChart";

export default function CommunityIntelligencePage() {
  const [kpis, setKpis] = useState<CommunityKpis | null>(null);
  const [indicators, setIndicators] = useState<CommunityIndicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<CommunityIndicator | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [kpiData, list] = await Promise.all([
          communityService.getKpis(),
          communityService.getIndicators(),
        ]);
        setKpis(kpiData);
        setIndicators(list);
        if (list.length > 0) {
          setSelectedIndicator(list[0]);
        }
      } catch (err) {
        console.error("Failed to load community intelligence", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSearch = async (val: string) => {
    setSearch(val);
    const filtered = await communityService.getIndicators(val);
    setIndicators(filtered);
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
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-[#0A0C10] border border-[#30363D] rounded-lg py-3 pl-12 pr-4 text-on-surface font-code-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50"
          placeholder="Search URL, domain, phone, UPI ID, crypto wallet or email..."
          type="text"
        />
      </div>

      {/* Summary KPI Cards (5 Indicators) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-gutter">
        <Card className="p-4 flex flex-col justify-between h-24">
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            URL Indicators
          </div>
          <div className="font-headline-sm text-headline-sm font-bold flex items-end justify-between">
            <span>{kpis?.urlCount || "12.4K"}</span>
            <span className="text-primary font-code-sm text-[11px] flex items-center">
              <Icon name="trending_up" className="text-[14px] mr-0.5" />
              {kpis?.urlChange || "+5%"}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between h-24">
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Domain Indicators
          </div>
          <div className="font-headline-sm text-headline-sm font-bold flex items-end justify-between">
            <span>{kpis?.domainCount || "8.2K"}</span>
            <span className="text-error font-code-sm text-[11px] flex items-center">
              <Icon name="trending_up" className="text-[14px] mr-0.5" />
              {kpis?.domainChange || "+12%"}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between h-24">
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Phone Indicators
          </div>
          <div className="font-headline-sm text-headline-sm font-bold flex items-end justify-between">
            <span>{kpis?.phoneCount || "45K"}</span>
            <span className="text-primary font-code-sm text-[11px] flex items-center">
              <Icon name="trending_down" className="text-[14px] mr-0.5" />
              {kpis?.phoneChange || "-2%"}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between h-24">
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            UPI Indicators
          </div>
          <div className="font-headline-sm text-headline-sm font-bold flex items-end justify-between">
            <span>{kpis?.upiCount || "3.1K"}</span>
            <span className="text-error font-code-sm text-[11px] flex items-center">
              <Icon name="trending_up" className="text-[14px] mr-0.5" />
              {kpis?.upiChange || "+8%"}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between h-24">
          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Email Indicators
          </div>
          <div className="font-headline-sm text-headline-sm font-bold flex items-end justify-between">
            <span>{kpis?.emailCount || "98K"}</span>
            <span className="text-primary font-code-sm text-[11px] flex items-center">
              <Icon name="trending_flat" className="text-[14px] mr-0.5" />
              {kpis?.emailChange || "0%"}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Left Area (Chart + Table), Right Area (Detail Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Left 2 Cols: Activity Chart + Table */}
        <div className="lg:col-span-2 space-y-stack-md">
          {/* Community Activity Chart */}
          <Card className="p-4 h-64 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                Community Reporting Velocity
              </h3>
              <select className="bg-transparent border border-[#30363D] rounded px-2 py-1 font-body-sm text-[12px] text-on-surface-variant focus:outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="flex-1 w-full relative">
              <CommunityActivityChart />
            </div>
          </Card>

          {/* Intelligence Table */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-[#30363D] flex justify-between items-center bg-[#161B22]">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                Recent Indicators ({indicators.length})
              </h3>
              <span className="text-primary font-body-sm text-[12px] flex items-center font-code-sm">
                Live Feed
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
                      Risk
                    </th>
                  </tr>
                </thead>
                <tbody className="font-code-sm text-code-sm text-on-surface divide-y divide-[#30363D]/30">
                  {indicators.map((item) => {
                    const isSelected = selectedIndicator?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedIndicator(item)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? "bg-[#1C2128] border-l-2 border-primary" : "hover:bg-[#1C2128]"
                        }`}
                      >
                        <td className="p-3 text-primary truncate max-w-[200px]">
                          {item.indicator}
                        </td>
                        <td className="p-3 text-on-surface-variant">{item.type}</td>
                        <td className="p-3 font-bold">{item.reportsCount}</td>
                        <td className="p-3 text-on-surface-variant">{item.firstSeen}</td>
                        <td className="p-3">
                          <Badge variant={item.risk}>{item.risk}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Detail Sidebar/Panel */}
        <div className="lg:col-span-1">
          {selectedIndicator && (
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

              {/* Timeline */}
              <div className="mb-6 flex-1">
                <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-3">
                  Indicator Telemetry Timeline
                </h4>
                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[7px] before:w-[1px] before:bg-[#30363D]">
                  {selectedIndicator.timeline?.map((ev) => (
                    <div key={ev.id} className="relative pl-6">
                      <span
                        className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-[#161B22] border-2 ${
                          ev.severity === "error"
                            ? "border-error shadow-[0_0_8px_rgba(255,180,171,0.4)]"
                            : ev.severity === "primary"
                            ? "border-primary"
                            : "border-on-surface-variant"
                        } z-10`}
                      />
                      <div className="font-code-sm text-[11px] text-on-surface-variant mb-0.5">
                        {ev.timestamp}
                      </div>
                      <div className="font-body-sm text-xs text-on-surface font-medium">
                        {ev.title}
                      </div>
                      {ev.description && (
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  ))}
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
                  <button className="flex-1 bg-surface-container-high border border-[#30363D] hover:bg-surface-container-highest text-on-surface font-body-sm text-xs py-2 rounded transition-colors flex justify-center items-center gap-1">
                    <Icon name="download" className="text-sm" /> Export STIX
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
