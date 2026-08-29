const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://truthlens-ai-1-7unv.onrender.com";

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
};
