"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { scanService } from "@/services/scanService";
import { ScanItem } from "@/types/scan";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Pagination } from "@/components/ui/Pagination";

export default function ScanHistoryPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Status: All");
  const [modalityFilter, setModalityFilter] = useState("Modality: All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await scanService.getScans({
          search,
          status: statusFilter,
          modality: modalityFilter,
          page,
          pageSize: 10,
        });
        setScans(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error("Failed to load scans", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [search, statusFilter, modalityFilter, page]);

  return (
    <div className="space-y-stack-md">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            Scan History
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Forensic logs, telemetry history and threat classifications.
          </p>
        </div>
        <Link href="/scan/new">
          <button className="bg-primary hover:bg-primary-fixed text-on-primary-fixed font-label-caps text-xs uppercase font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
            <Icon name="add" className="text-sm" /> New Scan
          </button>
        </Link>
      </header>

      {/* Filters and Search Toolbar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="w-full lg:w-1/3">
          <Input
            icon="search"
            placeholder="Search URLs, messages, or threat types..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option>Status: All</option>
            <option value="safe">Safe</option>
            <option value="suspicious">Suspicious</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical</option>
          </Select>

          {/* Modality Filter */}
          <Select
            value={modalityFilter}
            onChange={(e) => {
              setModalityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option>Modality: All</option>
            <option value="text">Text</option>
            <option value="url">URL</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="wallet">Wallet</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
          </Select>

          {/* Date Range & Clear */}
          <button className="bg-[#0A0C10] border border-[#30363D] text-on-surface font-label-caps text-xs rounded px-4 py-2 flex items-center gap-2 hover:border-outline-variant transition-colors">
            <Icon name="calendar_month" className="text-[16px]" />
            Last 7 Days
          </button>

          {(search || statusFilter !== "Status: All" || modalityFilter !== "Modality: All") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("Status: All");
                setModalityFilter("Modality: All");
                setPage(1);
              }}
              className="text-primary font-code-sm text-xs hover:underline flex items-center gap-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Event Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#30363D] bg-surface-container-highest/30">
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant font-medium">
                  Timestamp
                </th>
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant font-medium">
                  Input Source
                </th>
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant font-medium">
                  Modality
                </th>
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant font-medium">
                  Risk Score
                </th>
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant font-medium">
                  Severity
                </th>
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant font-medium">
                  Threat Type
                </th>
                <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant text-right font-medium">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/30 font-body-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant font-code-sm">
                    <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    Loading threat logs...
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant font-code-sm">
                    No scans matching the selected criteria.
                  </td>
                </tr>
              ) : (
                scans.map((scan) => {
                  let modIcon = "link";
                  if (scan.modality === "text") modIcon = "article";
                  else if (scan.modality === "image") modIcon = "image";
                  else if (scan.modality === "audio") modIcon = "mic";
                  else if (scan.modality === "video") modIcon = "videocam";
                  else if (scan.modality === "phone") modIcon = "phone";
                  else if (scan.modality === "email") modIcon = "mail";
                  else if (scan.modality === "wallet") modIcon = "account_balance_wallet";

                  return (
                    <tr
                      key={scan.id}
                      className="hover:bg-[#1C2128] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-code-sm text-xs text-on-surface-variant whitespace-nowrap">
                        {scan.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/scan/${scan.id}`}
                          className="flex items-center gap-2 group-hover:text-primary transition-colors"
                        >
                          <Icon name={modIcon} className="text-sm text-on-surface-variant" />
                          <span className="font-code-sm text-xs text-on-surface truncate max-w-[240px]">
                            {scan.targetInput}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-code-sm text-xs text-on-surface-variant uppercase">
                          {scan.modality}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16">
                            <ProgressBar
                              value={scan.riskScore}
                              colorClass={
                                scan.riskScore > 75
                                  ? "bg-error"
                                  : scan.riskScore > 40
                                  ? "bg-tertiary"
                                  : "bg-primary"
                              }
                            />
                          </div>
                          <span
                            className={`font-code-sm text-xs font-bold ${
                              scan.riskScore > 75
                                ? "text-error"
                                : scan.riskScore > 40
                                ? "text-tertiary"
                                : "text-primary"
                            }`}
                          >
                            {scan.riskScore < 10 ? `0${scan.riskScore}` : scan.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={scan.severity} glow={scan.severity === "critical"}>
                          {scan.severity}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-body-sm text-xs text-on-surface">
                        {scan.threatType || "Standard Threat"}
                      </td>
                      <td className="py-3 px-4 text-right font-code-sm text-xs text-on-surface">
                        {scan.confidence ? `${scan.confidence}%` : "--"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalEntries={total}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
}
