import {
  ModalityType,
  OverviewKpis,
  ScanFilters,
  ScanItem,
  ScanResult,
  SeverityDistributionData,
} from "@/types/scan";
import {
  MOCK_OVERVIEW_KPIS,
  MOCK_PRIMARY_SCAN_RESULT,
  MOCK_SCANS_LIST,
  MOCK_SEVERITY_DISTRIBUTION,
  MOCK_THREAT_ACTIVITY_SERIES,
} from "./mock/mockScans";
import { apiClient } from "./api/apiClient";
import { normalizeBackendScanResponse } from "./api/scanAdapter";

export interface IScanService {
  getOverviewKpis(): Promise<OverviewKpis>;
  getSeverityDistribution(): Promise<SeverityDistributionData>;
  getThreatActivity(timeframe: "7D" | "30D" | "90D"): Promise<{ time: string; threats: number; clean: number }[]>;
  getRecentScans(limit?: number): Promise<ScanItem[]>;
  getScans(filters?: ScanFilters): Promise<{ data: ScanItem[]; total: number; page: number; totalPages: number }>;
  getScanById(id: string): Promise<ScanResult | null>;
  createScan(content: string, modality: string, platform?: string, file?: File): Promise<ScanResult>;
}

// In-memory session store for live scan results
const inMemoryScans = new Map<string, ScanResult>();
const STORAGE_SCANS_KEY = "truthlens_scans_list";

function getStoredScans(): ScanItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_SCANS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (_) {}
  return [];
}

function saveStoredScan(item: ScanItem) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredScans();
    const filtered = existing.filter((s) => s.id !== item.id);
    filtered.unshift(item);
    window.localStorage.setItem(STORAGE_SCANS_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch (_) {}
}

class CentralizedScanService implements IScanService {
  async getOverviewKpis(): Promise<OverviewKpis> {
    try {
      const telemetry = await apiClient.getOverviewTelemetry();
      return {
        totalScans: telemetry.total_scans,
        totalScansLabel: telemetry.total_scans.toString(),
        totalScansTrend: "",
        threatsDetected: telemetry.threats_detected,
        threatsTrend: "",
        criticalThreats: telemetry.critical_threats,
        criticalThreatsTrend: "",
        communityReports: telemetry.community_reports_indexed,
        communityReportsLabel: telemetry.community_reports_indexed.toString(),
        communityReportsTrend: "",
        detectionConfidence: 0,
        avgResponseTime: "N/A",
        avgResponseTimeTrend: "",
      };
    } catch (err) {
      console.warn("Telemetry overview API unavailable, using local scan telemetry:", err);
      const scans = getStoredScans();
      const threats = scans.filter((s) => s.riskScore >= 40 || s.severity === "critical" || s.severity === "high" || s.severity === "suspicious");
      const criticals = scans.filter((s) => s.severity === "critical" || s.riskScore >= 80);

      return {
        totalScans: scans.length,
        totalScansLabel: scans.length > 0 ? scans.length.toString() : "0",
        totalScansTrend: "",
        threatsDetected: threats.length,
        threatsTrend: "",
        criticalThreats: criticals.length,
        criticalThreatsTrend: "",
        communityReports: 0,
        communityReportsLabel: "0",
        communityReportsTrend: "",
        detectionConfidence: 0,
        avgResponseTime: "N/A",
        avgResponseTimeTrend: "",
      };
    }
  }

  async getSeverityDistribution(): Promise<SeverityDistributionData> {
    try {
      const telemetry = await apiClient.getOverviewTelemetry();
      if (telemetry.severity_distribution && telemetry.severity_distribution.total !== undefined) {
        return telemetry.severity_distribution;
      }
    } catch (_) {}

    const scans = getStoredScans();
    const critical = scans.filter((s) => s.severity === "critical").length;
    const high = scans.filter((s) => s.severity === "high").length;
    const suspicious = scans.filter((s) => s.severity === "suspicious").length;
    const safe = scans.filter((s) => s.severity === "safe").length;

    return {
      critical,
      high,
      suspicious,
      safe,
      total: scans.length,
    };
  }

  async getThreatActivity(timeframe: "7D" | "30D" | "90D"): Promise<{ time: string; threats: number; clean: number }[]> {
    try {
      const telemetry = await apiClient.getOverviewTelemetry();
      if (telemetry.threat_activity && Array.isArray(telemetry.threat_activity) && telemetry.threat_activity.length > 0) {
        return telemetry.threat_activity;
      }
    } catch (_) {}

    const scans = getStoredScans();
    if (scans.length < 2) {
      return [];
    }

    const pointsMap = new Map<string, { threats: number; clean: number }>();
    scans.forEach((s) => {
      const dateStr = (s.timestamp || "").split(" ")[0] || "Today";
      const existing = pointsMap.get(dateStr) || { threats: 0, clean: 0 };
      if (s.riskScore >= 40 || s.severity === "critical" || s.severity === "high") {
        existing.threats += 1;
      } else {
        existing.clean += 1;
      }
      pointsMap.set(dateStr, existing);
    });

    return Array.from(pointsMap.entries()).map(([time, val]) => ({
      time,
      threats: val.threats,
      clean: val.clean,
    }));
  }

  async getRecentScans(limit = 5): Promise<ScanItem[]> {
    await new Promise((res) => setTimeout(res, 20));
    return getStoredScans().slice(0, limit);
  }

  async getScans(filters: ScanFilters = {}): Promise<{ data: ScanItem[]; total: number; page: number; totalPages: number }> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const offset = (page - 1) * pageSize;

    try {
      const res = await apiClient.getScans(pageSize, offset);
      let items: ScanItem[] = (res.items || []).map((item) => ({
        id: item.id,
        timestamp: item.timestamp,
        targetInput: item.target_input,
        modality: (item.modality as any) || "text",
        riskScore: item.risk_score,
        severity: (item.severity as any) || "safe",
        status: (item.status as any) || "complete",
        threatType: item.threat_type || item.verdict || "Forensic Analysis",
        confidence: undefined,
      }));

      // Apply client-side search/filters on current page results if active
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (s) =>
            s.targetInput.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            (s.threatType && s.threatType.toLowerCase().includes(q))
        );
      }

      if (filters.status && filters.status !== "Status: All") {
        items = items.filter((s) => s.severity.toLowerCase() === filters.status?.toLowerCase());
      }

      if (filters.modality && filters.modality !== "Modality: All") {
        items = items.filter((s) => s.modality.toLowerCase() === filters.modality?.toLowerCase());
      }

      const total = res.total;
      const totalPages = Math.ceil(total / pageSize) || 1;

      return {
        data: items,
        total,
        page,
        totalPages,
      };
    } catch (err) {
      console.warn("Could not load scans from backend /api/scans:", err);
      throw err;
    }
  }

  async getScanById(id: string): Promise<ScanResult | null> {
    // 1. Check in-memory store (for live scan results)
    if (inMemoryScans.has(id)) {
      return inMemoryScans.get(id)!;
    }

    // 2. Check browser sessionStorage if available
    if (typeof window !== "undefined") {
      try {
        const cached = window.sessionStorage.getItem(`tl_scan_${id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          inMemoryScans.set(id, parsed);
          return parsed;
        }
      } catch (_) {}
    }

    // 3. Try fetching from live backend by scan_id
    if (id && id !== "demo" && id !== MOCK_PRIMARY_SCAN_RESULT.id) {
      try {
        const backendData = await apiClient.getScanById(id);
        if (backendData && backendData.scan_id) {
          let modality: ModalityType = "text";
          if (backendData.input_type === "image" || backendData.image_forensics || backendData.extracted_text) {
            modality = "image";
          } else if (backendData.input_type === "audio" || backendData.audio_forensics || backendData.transcript) {
            modality = "audio";
          } else if (backendData.input_type === "video" || backendData.video_metadata || backendData.frames) {
            modality = "video";
          }

          const originalInput =
            (backendData as any).input ||
            backendData.transcript ||
            backendData.extracted_text ||
            `Scan ${backendData.scan_id.slice(0, 8)}`;

          const normalized = normalizeBackendScanResponse(
            backendData,
            originalInput,
            modality
          );

          inMemoryScans.set(normalized.id, normalized);
          if (typeof window !== "undefined") {
            try {
              window.sessionStorage.setItem(`tl_scan_${normalized.id}`, JSON.stringify(normalized));
            } catch (_) {}
          }
          saveStoredScan({
            id: normalized.id,
            timestamp: normalized.timestamp || "Just now",
            targetInput: (normalized.targetInput || "Target Payload").slice(0, 50),
            modality: normalized.modality,
            riskScore: normalized.riskScore,
            severity: normalized.severity,
            status: "complete",
            threatType: normalized.headline,
            confidence: normalized.confidence,
          });
          return normalized;
        }
      } catch (err) {
        console.warn(`Could not load scan ${id} from live backend:`, err);
      }
    }

    // 4. Return null if scan is not found in backend or local session
    return null;
  }

  async createScan(
    content: string,
    modality: string,
    platform = "telegram",
    file?: File
  ): Promise<ScanResult> {
    let backendResponse;
    let originalInput = content;

    // 1. TEXT / URL: Real backend POST /api/scan
    if (modality === "text") {
      backendResponse = await apiClient.submitTextScan(content, platform);
    }
    // 2. IMAGE: Real backend POST /api/scan/image
    else if (modality === "image") {
      if (!file) throw new Error("Please select an image file to analyze.");
      originalInput = file.name;
      backendResponse = await apiClient.submitImageScan(file, platform);
    }
    // 3. AUDIO: Real backend POST /api/scan/audio
    else if (modality === "audio") {
      if (!file) throw new Error("Please select an audio file to analyze.");
      originalInput = file.name;
      backendResponse = await apiClient.submitAudioScan(file, platform);
    }
    // 4. VIDEO: Real backend POST /api/scan/video
    else if (modality === "video") {
      if (!file) throw new Error("Please select a video file to analyze.");
      originalInput = file.name;
      backendResponse = await apiClient.submitVideoScan(file, platform);
    } else {
      throw new Error(`Unsupported scan modality: ${modality}`);
    }

    const normalizedResult = normalizeBackendScanResponse(
      backendResponse,
      originalInput,
      modality as any
    );

    // Cache the live result in memory & session storage
    inMemoryScans.set(normalizedResult.id, normalizedResult);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          `tl_scan_${normalizedResult.id}`,
          JSON.stringify(normalizedResult)
        );
      } catch (_) {}
    }

    // Save to persistent user scans
    const newScanItem: ScanItem = {
      id: normalizedResult.id,
      timestamp: normalizedResult.timestamp || "Just now",
      targetInput: originalInput.slice(0, 50),
      modality: modality as any,
      riskScore: normalizedResult.riskScore,
      severity: normalizedResult.severity,
      status: "complete",
      threatType: backendResponse.threat_type || `${modality.toUpperCase()} Forensics`,
      confidence: normalizedResult.confidence,
    };
    saveStoredScan(newScanItem);

    return normalizedResult;
  }
}

export const scanService: IScanService = new CentralizedScanService();
