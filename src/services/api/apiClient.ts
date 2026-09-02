const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://truthlens-ai-1-7unv.onrender.com";

export interface BackendScanRequest {
  input: string;
  platform?: string;
}

export interface BackendEvidenceItem {
  signal: string;
  points: number;
}

export interface BackendAiAnalysis {
  scam_intent?: boolean;
  social_engineering?: boolean;
  impersonation?: boolean;
  financial_manipulation?: boolean;
  urgency?: string;
  confidence?: string;
  explanation?: string;
  threat_type?: string;
}

export interface BackendVirusTotalItem {
  url?: string;
  status?: string;
  malicious?: number;
  suspicious?: number;
  harmless?: number;
  undetected?: number;
}

export interface BackendExtractedEntities {
  urls?: string[];
  upi_ids?: string[];
  phone_numbers?: string[];
  emails?: string[];
}

export interface BackendTiming {
  detector_ms?: number;
  llm_ms?: number;
  virustotal_ms?: number;
  risk_engine_ms?: number;
  pipeline_total_ms?: number;
}

export interface BackendImageForensics {
  exif?: {
    available?: boolean;
    fields?: Record<string, any>;
    error?: string;
  };
  ela?: {
    supported?: boolean;
    possible_editing_indicators?: boolean | null;
    reason?: string;
    mean_error?: number;
    max_error?: number;
    high_error_pixel_percent?: number;
  };
}

export interface BackendVideoFrame {
  timestamp_seconds: number;
  ocr_text?: string;
  ocr_error?: string;
  image_forensics?: BackendImageForensics;
}

export interface BackendVideoMetadata {
  duration_seconds?: number;
  width?: number;
  height?: number;
  has_audio?: boolean;
  format_name?: string;
  bit_rate?: number;
}

export interface BackendAudioForensics {
  duration_seconds?: number;
  sample_rate?: number;
  channels?: number;
  bit_depth?: number;
  format?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface BackendTranscriptionResult {
  status?: string;
  text?: string | null;
  confidence?: number;
  language?: string;
  code?: string;
  message?: string;
  reason?: string;
}

export interface BackendScanResponse {
  scan_id: string;
  risk_score: number | null;
  severity: string | null;
  confidence: string | null;
  threat_type: string | null;
  evidence: BackendEvidenceItem[];
  ai_analysis?: BackendAiAnalysis | null;
  virustotal?: BackendVirusTotalItem[];
  recommendation?: string | null;
  extracted_entities?: BackendExtractedEntities;
  timing?: BackendTiming;
  timestamp?: string;
  input_type?: string;
  platform?: string;

  // Image specific
  extracted_text?: string;
  ocr_status?: string;
  image_forensics?: BackendImageForensics;

  // Audio specific
  transcript?: string | null;
  transcription?: BackendTranscriptionResult;
  audio_forensics?: BackendAudioForensics;

  // Video specific
  video_metadata?: BackendVideoMetadata;
  frames?: BackendVideoFrame[];
  frame_ocr_text?: string;
  video_forensics?: {
    frame_possible_editing_indicators?: boolean | null;
  };
  analysis_source?: string;

  // Error responses
  error?: string | { code?: string; message?: string };
  detail?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Dispatches a multipart/form-data upload request to the backend.
 * Browser automatically sets the multipart boundary header.
 */
async function dispatchMultipartScan(
  endpointPath: string,
  file: File,
  platform = "telegram",
  timeoutMs = 60000
): Promise<BackendScanResponse> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${endpointPath}`;

  const formData = new FormData();
  formData.append("file", file);
  if (platform) {
    formData.append("platform", platform);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Notice: Do NOT manually set Content-Type header so the browser includes boundary
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = `Backend HTTP ${response.status} ${response.statusText}`;
      let errorCode = "HTTP_ERROR";
      try {
        const errorJson = await response.json();
        if (typeof errorJson.error === "object" && errorJson.error?.message) {
          errorDetail = errorJson.error.message;
          errorCode = errorJson.error.code || errorCode;
        } else if (typeof errorJson.error === "string") {
          errorDetail = errorJson.error;
        } else if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch (_) {}
      throw new ApiError(errorDetail, response.status, errorCode);
    }

    const data: BackendScanResponse = await response.json();

    // Check if backend returned an error structure in 200 response
    if (data.error) {
      const errMsg = typeof data.error === "string" ? data.error : data.error.message || "Scan processing error";
      const errCode = typeof data.error === "object" ? data.error.code : undefined;
      throw new ApiError(errMsg, 422, errCode);
    }

    return data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new ApiError(
        `Analysis timed out after ${(timeoutMs / 1000).toFixed(0)} seconds. Render may be cold starting or analyzing complex multimedia content.`,
        408,
        "TIMEOUT"
      );
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || "Failed to communicate with TruthLensAI backend.",
      500,
      "NETWORK_ERROR"
    );
  }
}

export const apiClient = {
  // 1. Text / URL Scan (POST /api/scan)
  async submitTextScan(
    input: string,
    platform = "telegram"
  ): Promise<BackendScanResponse> {
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/scan`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ input, platform }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = `Backend HTTP ${response.status} ${response.statusText}`;
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorJson.error || errorDetail;
        } catch (_) {}
        throw new ApiError(errorDetail, response.status);
      }

      const data: BackendScanResponse = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new ApiError("Analysis timed out. Please retry.", 408, "TIMEOUT");
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.message || "Failed to communicate with TruthLensAI backend.",
        500,
        "NETWORK_ERROR"
      );
    }
  },

  // 2. Image Scan (POST /api/scan/image)
  async submitImageScan(
    file: File,
    platform = "telegram"
  ): Promise<BackendScanResponse> {
    return dispatchMultipartScan("/api/scan/image", file, platform, 60000); // 60s timeout for OCR + AI + VT
  },

  // 3. Audio Scan (POST /api/scan/audio)
  async submitAudioScan(
    file: File,
    platform = "telegram"
  ): Promise<BackendScanResponse> {
    return dispatchMultipartScan("/api/scan/audio", file, platform, 180000); // 180s timeout for FFmpeg + Whisper + AI + VT
  },

  // 4. Video Scan (POST /api/scan/video)
  async submitVideoScan(
    file: File,
    platform = "telegram"
  ): Promise<BackendScanResponse> {
    return dispatchMultipartScan("/api/scan/video", file, platform, 240000); // 240s timeout for Frames + Audio + Whisper + AI + VT
  },

  // 5. Retrieve Scan by ID (GET /api/scan/{scan_id})
  async getScanById(scanId: string): Promise<BackendScanResponse> {
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/scan/${encodeURIComponent(scanId)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = `Backend HTTP ${response.status} ${response.statusText}`;
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorJson.error || errorDetail;
        } catch (_) {}
        throw new ApiError(errorDetail, response.status);
      }

      const data: BackendScanResponse = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new ApiError("Scan retrieval timed out. Please retry.", 408, "TIMEOUT");
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.message || "Failed to retrieve scan from TruthLensAI backend.",
        500,
        "NETWORK_ERROR"
      );
    }
  },

  // 6. Platform Telemetry Overview (GET /api/telemetry/overview)
  async getOverviewTelemetry(): Promise<BackendTelemetryOverview> {
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/telemetry/overview`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`Backend HTTP ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || "Failed to fetch platform telemetry overview",
        500,
        "NETWORK_ERROR"
      );
    }
  },

  // 7. Paginated Scan History (GET /api/scans?limit={limit}&offset={offset})
  async getScans(limit = 10, offset = 0): Promise<BackendScanHistoryResponse> {
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/scans?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`Backend HTTP ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || "Failed to fetch scan history from backend",
        500,
        "NETWORK_ERROR"
      );
    }
  },

  // 8. Community Intelligence Feed (GET /api/community/feed?limit={limit})
  async getCommunityFeed(limit = 50): Promise<BackendCommunityFeedResponse> {
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/community/feed?limit=${encodeURIComponent(limit)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`Backend HTTP ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || "Failed to fetch community intelligence feed",
        500,
        "NETWORK_ERROR"
      );
    }
  },

  // 8b. Block Community Indicator (POST /api/community/block)
  async blockIndicator(
    indicator: string,
    blocked: boolean
  ): Promise<{ success: boolean; indicator: string; blocked: boolean; updated_count: number }> {
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/community/block`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ indicator, blocked }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errDetail = `Backend HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson?.detail) errDetail = errJson.detail;
        } catch (_) {}
        throw new ApiError(errDetail, response.status);
      }

      return await response.json();
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || "Failed to update indicator block state in database",
        500,
        "NETWORK_ERROR"
      );
    }
  },

  // 9. Incident Reports (GET /api/incidents?limit={limit}&offset={offset})
  async getIncidents(limit = 20, offset = 0): Promise<BackendIncidentsResponse> {
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/incidents?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`Backend HTTP ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || "Failed to fetch incidents from backend",
        500,
        "NETWORK_ERROR"
      );
    }
  },

  // 10. Create Incident (POST /api/incidents)
  async createIncident(data: {
    scan_id: string;
    platform?: string;
    evidence_json?: any;
  }): Promise<BackendIncidentItem> {
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/incidents`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`Backend HTTP ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || "Failed to create incident on backend",
        500,
        "NETWORK_ERROR"
      );
    }
  },

  // 11. Update Incident Status (PATCH /api/incidents/{incident_id})
  async updateIncidentStatus(
    incidentId: string,
    status: "investigating" | "open" | "resolved" | string
  ): Promise<BackendIncidentItem> {
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/incidents/${encodeURIComponent(incidentId)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`Backend HTTP ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || "Failed to update incident status on backend",
        500,
        "NETWORK_ERROR"
      );
    }
  },
};

export interface BackendTelemetryOverview {
  total_scans: number;
  threats_detected: number;
  critical_threats: number;
  community_reports_indexed: number;
  severity_distribution: {
    critical: number;
    high: number;
    suspicious: number;
    safe: number;
    total: number;
  };
  threat_activity: Array<{
    time: string;
    threats: number;
    clean: number;
  }>;
}

export interface BackendScanHistoryItem {
  id: string;
  timestamp: string;
  platform: string;
  target_input: string;
  modality: string;
  risk_score: number;
  severity: string;
  verdict: string;
  threat_type: string;
  status: string;
}

export interface BackendScanHistoryResponse {
  items: BackendScanHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface BackendCommunityIndicatorItem {
  indicator: string;
  indicator_type: string;
  report_count: number;
  risk_tier: string;
  first_seen: string | null;
  last_seen: string | null;
  is_blocked?: boolean;
}

export interface BackendCommunityFeedResponse {
  items: BackendCommunityIndicatorItem[];
  total: number;
}

export interface BackendIncidentItem {
  id: string;
  scan_id: string;
  title: string;
  channel: string;
  severity: string;
  risk_score: number;
  confidence: string;
  status: string;
  created_at: string;
  summary: string;
}

export interface BackendIncidentsResponse {
  items: BackendIncidentItem[];
  total: number;
  limit: number;
  offset: number;
}
