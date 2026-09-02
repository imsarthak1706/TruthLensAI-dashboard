"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { incidentService } from "@/services/incidentService";
import { IncidentDetail, IncidentItem, IncidentKpis } from "@/types/incident";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SlideOver } from "@/components/ui/SlideOver";
import { Pagination } from "@/components/ui/Pagination";

function IncidentCenterContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedIdFromUrl = searchParams?.get("selectedId");

  const [kpis, setKpis] = useState<IncidentKpis | null>(null);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentDetail | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [resolving, setResolving] = useState(false);
  const pageSize = 10;

  const removeSelectedIdFromUrl = React.useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (params.has("selectedId")) {
      params.delete("selectedId");
      const qs = params.toString();
      const nextUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }
  }, [router, pathname, searchParams]);

  const statusFilterRef = React.useRef(statusFilter);
  statusFilterRef.current = statusFilter;
  const searchRef = React.useRef(search);
  searchRef.current = search;

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, items] = await Promise.all([
        incidentService.getKpis(),
        incidentService.getIncidents(pageSize, (page - 1) * pageSize),
      ]);
      setKpis(kpiData);
      setIncidents(items);

      const targetId = selectedIdFromUrl || items[0]?.id;
      if (targetId) {
        const detail = await incidentService.getIncidentById(targetId);
        if (detail) {
          const currentFilter = statusFilterRef.current;
          const currentSearch = searchRef.current;

          const matchStatus =
            currentFilter === "all" ||
            detail.status.toLowerCase() === currentFilter.toLowerCase();
          const matchSearch =
            !currentSearch ||
            detail.id.toLowerCase().includes(currentSearch.toLowerCase()) ||
            detail.threatType.toLowerCase().includes(currentSearch.toLowerCase()) ||
            detail.platform.toLowerCase().includes(currentSearch.toLowerCase());

          if (matchStatus && matchSearch) {
            setSelectedIncident(detail);
          } else {
            setSelectedIncident(null);
            if (selectedIdFromUrl) {
              removeSelectedIdFromUrl();
            }
          }
        } else {
          setSelectedIncident(null);
          if (selectedIdFromUrl) {
            removeSelectedIdFromUrl();
          }
        }
      } else {
        setSelectedIncident(null);
      }
    } catch (err) {
      console.error("Failed to load incidents", err);
      setError("Incident telemetry unavailable");
      setIncidents([]);
      setSelectedIncident(null);
    } finally {
      setLoading(false);
    }
  }, [selectedIdFromUrl, page, removeSelectedIdFromUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectIncident = async (id: string) => {
    try {
      const detail = await incidentService.getIncidentById(id);
      setSelectedIncident(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseDetail = () => {
    setSelectedIncident(null);
    removeSelectedIdFromUrl();
  };

  const handleResolve = async () => {
    if (!selectedIncident || resolving) return;
    try {
      setResolving(true);
      await incidentService.updateIncidentStatus(selectedIncident.id, "resolved");

      // Update current selected incident and table state
      setSelectedIncident((prev) => (prev ? { ...prev, status: "resolved" } : null));
      setIncidents((prev) =>
        prev.map((i) => (i.id === selectedIncident.id ? { ...i, status: "resolved" } : i))
      );

      // Re-fetch authoritative KPIs from backend to reflect new resolved counts
      const updatedKpis = await incidentService.getKpis();
      setKpis(updatedKpis);
    } catch (err) {
      console.error("Failed to resolve incident", err);
    } finally {
      setResolving(false);
    }
  };

  const filteredIncidents = React.useMemo(() => {
    return incidents.filter((i) => {
      const matchSearch =
        !search ||
        i.id.toLowerCase().includes(search.toLowerCase()) ||
        i.threatType.toLowerCase().includes(search.toLowerCase()) ||
        i.platform.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" || i.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [incidents, search, statusFilter]);

  // Reconcile open detail drawer when filters or search change
  useEffect(() => {
    if (!selectedIncident) return;
    const isStillVisible = filteredIncidents.some((i) => i.id === selectedIncident.id);
    if (!isStillVisible) {
      setSelectedIncident(null);
      removeSelectedIdFromUrl();
    }
  }, [statusFilter, search, incidents, selectedIncident, removeSelectedIdFromUrl]);

  const handleStatusFilterChange = (st: string) => {
    setStatusFilter(st);
    setPage(1);
    if (selectedIncident) {
      const matchStatus = st === "all" || selectedIncident.status.toLowerCase() === st.toLowerCase();
      const matchSearch =
        !search ||
        selectedIncident.id.toLowerCase().includes(search.toLowerCase()) ||
        selectedIncident.threatType.toLowerCase().includes(search.toLowerCase()) ||
        selectedIncident.platform.toLowerCase().includes(search.toLowerCase());
      if (!matchStatus || !matchSearch) {
        setSelectedIncident(null);
        removeSelectedIdFromUrl();
      }
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    if (selectedIncident) {
      const matchSearch =
        !val ||
        selectedIncident.id.toLowerCase().includes(val.toLowerCase()) ||
        selectedIncident.threatType.toLowerCase().includes(val.toLowerCase()) ||
        selectedIncident.platform.toLowerCase().includes(val.toLowerCase());
      const matchStatus =
        statusFilter === "all" || selectedIncident.status.toLowerCase() === statusFilter.toLowerCase();
      if (!matchSearch || !matchStatus) {
        setSelectedIncident(null);
        removeSelectedIdFromUrl();
      }
    }
  };

  const totalCount = kpis?.total ?? incidents.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const pagedIncidents = filteredIncidents;

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
        <Card className="p-5 flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Total Incidents
            </span>
            <Icon name="list_alt" className="text-primary text-xl" />
          </div>
          <div className="flex flex-col mt-auto z-10">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {loading ? "..." : (kpis?.total ?? 0)}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {kpis && kpis.total > 0 ? "Indexed incidents" : "No live incident telemetry"}
            </span>
          </div>
        </Card>

        {/* Critical */}
        <Card className="p-5 flex flex-col justify-between h-28 relative overflow-hidden group border-error/40 shadow-[0_0_15px_rgba(255,180,171,0.08)]">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-caps text-label-caps text-error uppercase tracking-wider font-bold">
              Critical
            </span>
            <Icon name="warning" className="text-error text-xl" />
          </div>
          <div className="flex flex-col mt-auto z-10">
            <span className="font-display-lg text-display-lg text-error font-bold">
              {loading ? "..." : (kpis?.critical ?? 0)}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {kpis && kpis.critical > 0 ? "Action Required" : "No critical threats"}
            </span>
          </div>
        </Card>

        {/* Investigating */}
        <Card className="p-5 flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Investigating
            </span>
            <Icon name="search" className="text-tertiary text-xl" />
          </div>
          <div className="flex flex-col mt-auto z-10">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {loading ? "..." : (kpis?.investigating ?? 0)}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {kpis && kpis.investigating > 0 ? "Active Triage" : "Queue clear"}
            </span>
          </div>
        </Card>

        {/* Resolved */}
        <Card className="p-5 flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Resolved
            </span>
            <Icon name="check_circle" className="text-secondary text-xl" />
          </div>
          <div className="flex flex-col mt-auto z-10">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {loading ? "..." : (kpis?.resolved ?? 0)}
            </span>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {kpis && kpis.resolved > 0 ? "Resolved incidents" : "No closed records"}
            </span>
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
                  onClick={() => handleStatusFilterChange(st)}
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
                onChange={(e) => handleSearchChange(e.target.value)}
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
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-on-surface-variant font-code-sm">
                        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mr-2" />
                        Loading incident logs...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-on-surface-variant font-code-sm">
                        <div className="space-y-2 max-w-sm mx-auto">
                          <Icon name="error_outline" className="text-error text-3xl mx-auto opacity-70" />
                          <p className="font-code-sm text-sm text-error font-semibold">
                            Incident telemetry unavailable
                          </p>
                          <p className="text-xs text-on-surface-variant/70">
                            Unable to connect to the incident database.
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
                  ) : filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-on-surface-variant font-code-sm">
                        <div className="space-y-1 max-w-sm mx-auto">
                          <Icon name="verified_user" className="text-3xl mx-auto opacity-40 mb-1" />
                          <p className="font-code-sm text-xs text-on-surface font-semibold">
                            {search || statusFilter !== "all"
                              ? "No incidents matching the selected criteria."
                              : "No incidents recorded"}
                          </p>
                          <p className="text-[11px] font-code-sm text-on-surface-variant/70">
                            {search || statusFilter !== "all"
                              ? "Try adjusting your search terms or filter."
                              : "Escalated threats and reported incidents will appear here."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedIncidents.map((inc) => {
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
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalCount > pageSize && (
              <div className="p-3 border-t border-[#30363D]">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalEntries={totalCount}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Slide-over Triage Drawer (Right Side) */}
        {selectedIncident && (
          <SlideOver
            isOpen={!!selectedIncident}
            onClose={handleCloseDetail}
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
                  disabled={resolving || selectedIncident.status === "resolved"}
                  className="flex-1 bg-primary hover:bg-primary-fixed text-on-primary font-bold py-2 px-4 rounded text-xs transition-colors shadow-[0_0_10px_rgba(111,221,120,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {resolving ? (
                    <>
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                      <span>Resolving...</span>
                    </>
                  ) : selectedIncident.status === "resolved" ? (
                    <>
                      <Icon name="check_circle" className="text-sm" />
                      <span>Resolved</span>
                    </>
                  ) : (
                    "Mark Resolved"
                  )}
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

              {/* Linked Scan ID */}
              {selectedIncident.scanId && (
                <div className="col-span-2 pt-2 border-t border-[#30363D]/40 flex items-center justify-between">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Forensic Scan ID
                  </span>
                  <Link
                    href={`/scan/${selectedIncident.scanId}`}
                    className="font-code-sm text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>{selectedIncident.scanId.slice(0, 16)}...</span>
                    <Icon name="open_in_new" className="text-xs" />
                  </Link>
                </div>
              )}
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

export default function IncidentCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-code-sm text-sm text-on-surface-variant">
            Loading Incident Center...
          </p>
        </div>
      }
    >
      <IncidentCenterContent />
    </Suspense>
  );
}

