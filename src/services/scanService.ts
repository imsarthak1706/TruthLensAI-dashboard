import {
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

class CentralizedScanService implements IScanService {
  async getOverviewKpis(): Promise<OverviewKpis> {
    await new Promise((res) => setTimeout(res, 20));
    return MOCK_OVERVIEW_KPIS;
  }

  async getSeverityDistribution(): Promise<SeverityDistributionData> {
    await new Promise((res) => setTimeout(res, 20));
    return MOCK_SEVERITY_DISTRIBUTION;
  }

  async getThreatActivity(timeframe: "7D" | "30D" | "90D"): Promise<{ time: string; threats: number; clean: number }[]> {
    await new Promise((res) => setTimeout(res, 20));
    return MOCK_THREAT_ACTIVITY_SERIES[timeframe] || MOCK_THREAT_ACTIVITY_SERIES["30D"];
  }

  async getRecentScans(limit = 5): Promise<ScanItem[]> {
    await new Promise((res) => setTimeout(res, 20));
    return MOCK_SCANS_LIST.slice(0, limit);
  }

  async getScans(filters: ScanFilters = {}): Promise<{ data: ScanItem[]; total: number; page: number; totalPages: number }> {
    await new Promise((res) => setTimeout(res, 40));
    let result = [...MOCK_SCANS_LIST];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.targetInput.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          (s.threatType && s.threatType.toLowerCase().includes(q))
      );
    }

    if (filters.status && filters.status !== "Status: All") {
      result = result.filter((s) => s.severity.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters.modality && filters.modality !== "Modality: All") {
      result = result.filter((s) => s.modality.toLowerCase() === filters.modality?.toLowerCase());
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paginated = result.slice(start, start + pageSize);

    return {
      data: paginated,
      total: result.length,
      page,
      totalPages: Math.ceil(result.length / pageSize) || 1,
    };
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

    // 3. Fallback for demo static records if directly navigated by mock ID
    if (id === MOCK_PRIMARY_SCAN_RESULT.id || id === "demo" || !id) {
      return MOCK_PRIMARY_SCAN_RESULT;
    }

    const found = MOCK_SCANS_LIST.find((s) => s.id === id);
    if (found) {
      return {
        ...MOCK_PRIMARY_SCAN_RESULT,
        id: found.id,
        targetInput: found.targetInput,
        modality: found.modality,
        riskScore: found.riskScore,
        severity: found.severity,
        confidence: found.confidence || 95,
        headline: `${found.threatType || "Threat"} Detected`,
      };
    }

    return MOCK_PRIMARY_SCAN_RESULT;
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

    // Prepend to recent scans list
    const newScanItem: ScanItem = {
      id: normalizedResult.id,
      timestamp: "Just now",
      targetInput: originalInput.slice(0, 50),
      modality: modality as any,
      riskScore: normalizedResult.riskScore,
      severity: normalizedResult.severity,
      status: "complete",
      threatType: backendResponse.threat_type || `${modality.toUpperCase()} Forensics`,
      confidence: normalizedResult.confidence,
    };
    MOCK_SCANS_LIST.unshift(newScanItem);

    return normalizedResult;
  }
}

export const scanService: IScanService = new CentralizedScanService();
