export type ModalityType = 'text' | 'image' | 'audio' | 'video' | 'url' | 'wallet' | 'phone' | 'email';
export type SeverityLevel = 'safe' | 'suspicious' | 'high' | 'critical';
export type ScanStatus = 'complete' | 'analyzing' | 'queued' | 'failed';

export interface ScanItem {
  id: string;
  timestamp: string;
  targetInput: string;
  modality: ModalityType;
  riskScore: number;
  severity: SeverityLevel;
  status: ScanStatus;
  threatType?: string;
  confidence?: number;
}

export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
}

export interface MetricBreakdown {
  name: string;
  score?: number;
  statusText?: string;
  category: 'critical' | 'warning' | 'info';
}

export interface ExternalIntelSummary {
  provider: string;
  maliciousCount: number;
  suspiciousCount: number;
  harmlessCount: number;
  totalEngines: number;
  available?: boolean;
}

export interface CommunityReputationItem {
  type: string;
  target: string;
  reportCount?: number;
  riskLabel?: string;
  severity: SeverityLevel;
  statusText?: string;
  firstSeen?: string;
  lastSeen?: string;
}

export interface ScanTiming {
  detector_ms?: number;
  llm_ms?: number;
  virustotal_ms?: number;
  risk_engine_ms?: number;
  pipeline_total_ms?: number;
}

export interface ExtractedEntities {
  urls?: string[];
  upi_ids?: string[];
  phone_numbers?: string[];
  emails?: string[];
}

export interface ImageForensics {
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

export interface VideoFrame {
  timestamp_seconds: number;
  ocr_text?: string;
  ocr_error?: string;
  image_forensics?: ImageForensics;
}

export interface VideoMetadata {
  duration_seconds?: number;
  width?: number;
  height?: number;
  has_audio?: boolean;
  format_name?: string;
  bit_rate?: number;
}

export interface AudioForensics {
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

export interface TranscriptionResult {
  status?: string;
  text?: string | null;
  confidence?: number;
  language?: string;
  code?: string;
  message?: string;
  reason?: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  targetInput: string;
  modality: ModalityType;
  riskScore: number;
  severity: SeverityLevel;
  confidence: number;
  confidenceLabel: string;
  headline: string;
  status: ScanStatus;
  recommendation: string;
  aiExplanation: string;
  breakdown: MetricBreakdown[];
  evidence: EvidenceItem[];
  externalIntel: ExternalIntelSummary;
  communityIntel: CommunityReputationItem[];
  communityStatus?: "indexed" | "not_indexed" | "no_indicator" | "error";
  timing?: ScanTiming;
  extractedEntities?: ExtractedEntities;

  // Modality-specific forensics
  extractedText?: string;
  ocrStatus?: string;
  imageForensics?: ImageForensics;
  transcript?: string | null;
  transcription?: TranscriptionResult;
  audioForensics?: AudioForensics;
  videoMetadata?: VideoMetadata;
  frames?: VideoFrame[];
  frameOcrText?: string;
  videoForensics?: {
    frame_possible_editing_indicators?: boolean | null;
  };
  analysisSource?: string;
}

export interface OverviewKpis {
  totalScans: number;
  totalScansLabel: string;
  totalScansTrend: string;
  threatsDetected: number;
  threatsTrend: string;
  criticalThreats: number;
  criticalThreatsTrend: string;
  communityReports: number;
  communityReportsLabel: string;
  communityReportsTrend: string;
  detectionConfidence: number;
  avgResponseTime: string;
  avgResponseTimeTrend: string;
}

export interface SeverityDistributionData {
  critical: number;
  high: number;
  suspicious: number;
  safe: number;
  total: number;
}

export interface ThreatActivityTimeframeData {
  timeframe: '7D' | '30D' | '90D';
  points: { time: string; threats: number; clean: number }[];
}

export interface ScanFilters {
  search?: string;
  status?: string;
  modality?: string;
  dateRange?: string;
  page?: number;
  pageSize?: number;
}
