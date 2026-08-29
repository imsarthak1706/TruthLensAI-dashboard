import { IncidentArtifact, IncidentDetail, IncidentItem, IncidentKpis, IncidentSeverity } from "@/types/incident";
import { ScanResult } from "@/types/scan";
import { MOCK_INCIDENT_DETAIL_INC4092, MOCK_INCIDENT_KPIS, MOCK_INCIDENTS_LIST } from "./mock/mockIncidents";

export interface IIncidentService {
  getKpis(): Promise<IncidentKpis>;
  getIncidents(): Promise<IncidentItem[]>;
  getIncidentById(id: string): Promise<IncidentDetail | null>;
  updateIncidentStatus(id: string, status: "open" | "investigating" | "resolved"): Promise<void>;
  createIncidentFromScan(scan: ScanResult): Promise<IncidentDetail>;
}

// In-memory cache
let inMemoryIncidents: IncidentItem[] = [...MOCK_INCIDENTS_LIST];
const inMemoryDetails = new Map<string, IncidentDetail>();

// Preload mock detail
inMemoryDetails.set("INC-4092", MOCK_INCIDENT_DETAIL_INC4092);

const STORAGE_INCIDENTS_KEY = "truthlens_incidents_list";
const STORAGE_INCIDENT_PREFIX = "truthlens_incident_detail_";

function getStoredIncidents(): IncidentItem[] {
  if (typeof window === "undefined") return inMemoryIncidents;
  try {
    const raw = window.localStorage.getItem(STORAGE_INCIDENTS_KEY);
    if (raw) {
      const parsed: IncidentItem[] = JSON.parse(raw);
      // Merge unique
      const existingIds = new Set(inMemoryIncidents.map((i) => i.id));
      parsed.forEach((item) => {
        if (!existingIds.has(item.id)) {
          inMemoryIncidents.unshift(item);
          existingIds.add(item.id);
        }
      });
    }
  } catch (_) {}
  return inMemoryIncidents;
}

function saveStoredIncidents(list: IncidentItem[]) {
  inMemoryIncidents = list;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(list));
    } catch (_) {}
  }
}

class CentralizedIncidentService implements IIncidentService {
  async getKpis(): Promise<IncidentKpis> {
    await new Promise((r) => setTimeout(r, 40));
    const items = getStoredIncidents();
    const criticalCount = items.filter((i) => i.severity === "critical").length;
    const investigatingCount = items.filter((i) => i.status === "investigating").length;
    const resolvedCount = items.filter((i) => i.status === "resolved").length;

    return {
      total: items.length,
      critical: criticalCount,
      investigating: investigatingCount,
      resolved: resolvedCount,
      weeklyChangePercent: MOCK_INCIDENT_KPIS.weeklyChangePercent,
      resolutionRateChangePercent: MOCK_INCIDENT_KPIS.resolutionRateChangePercent,
    };
  }

  async getIncidents(): Promise<IncidentItem[]> {
    await new Promise((r) => setTimeout(r, 40));
    return getStoredIncidents();
  }

  async getIncidentById(id: string): Promise<IncidentDetail | null> {
    await new Promise((r) => setTimeout(r, 40));

    // 1. Check in-memory detail cache
    if (inMemoryDetails.has(id)) {
      return inMemoryDetails.get(id)!;
    }

    // 2. Check localStorage
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(`${STORAGE_INCIDENT_PREFIX}${id}`);
        if (raw) {
          const detail: IncidentDetail = JSON.parse(raw);
          inMemoryDetails.set(id, detail);
          return detail;
        }
      } catch (_) {}
    }

    // 3. Fallback for mock items
    const items = getStoredIncidents();
    const found = items.find((i) => i.id === id);
    if (found) {
      const fallbackDetail: IncidentDetail = {
        ...found,
        riskOverview: found.description || "Automated threat intelligence triage record.",
        evidenceArtifacts: [
          {
            id: `art-${found.id}-1`,
            name: `forensic_scan_report_${found.id}.json`,
            type: "Forensic Report",
            size: "18kb",
            actionIcon: "description",
          },
        ],
        aiRecommendations: [
          "Quarantine sender / host address across perimeter security.",
          "Verify multi-factor authentication on potentially targeted accounts.",
        ],
      };
      inMemoryDetails.set(id, fallbackDetail);
      return fallbackDetail;
    }

    return MOCK_INCIDENT_DETAIL_INC4092;
  }

  async updateIncidentStatus(id: string, status: "open" | "investigating" | "resolved"): Promise<void> {
    await new Promise((r) => setTimeout(r, 50));
    const items = getStoredIncidents();
    const target = items.find((i) => i.id === id);
    if (target) {
      target.status = status;
      saveStoredIncidents([...items]);
    }

    const detail = await this.getIncidentById(id);
    if (detail) {
      detail.status = status;
      inMemoryDetails.set(id, detail);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(`${STORAGE_INCIDENT_PREFIX}${id}`, JSON.stringify(detail));
        } catch (_) {}
      }
    }
  }

  async createIncidentFromScan(scan: ScanResult): Promise<IncidentDetail> {
    await new Promise((r) => setTimeout(r, 50));

    // Generate unique short incident ID based on scan ID or random seed
    const rawCleanId = scan.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
    const incidentId = `INC-${rawCleanId || Math.floor(1000 + Math.random() * 9000)}`;

    // Build evidence artifacts from actual scan data
    const evidenceArtifacts: IncidentArtifact[] = [];

    // Main scan report artifact
    evidenceArtifacts.push({
      id: `art-${incidentId}-scan`,
      name: `scan_${scan.id.slice(0, 8)}.json`,
      type: `${scan.modality.toUpperCase()} Telemetry`,
      size: "Full Report",
      actionIcon: "visibility",
    });

    if (scan.transcript) {
      evidenceArtifacts.push({
        id: `art-${incidentId}-transcript`,
        name: "audio_speech_transcript.txt",
        type: "Speech Audio",
        size: `${scan.transcript.length} chars`,
        actionIcon: "graphic_eq",
      });
    }

    if (scan.extractedText) {
      evidenceArtifacts.push({
        id: `art-${incidentId}-ocr`,
        name: "ocr_extracted_text.txt",
        type: "Visual OCR",
        size: `${scan.extractedText.length} chars`,
        actionIcon: "document_scanner",
      });
    }

    if (scan.frameOcrText) {
      evidenceArtifacts.push({
        id: `art-${incidentId}-video-ocr`,
        name: "video_keyframe_ocr.txt",
        type: "Video Frames",
        size: "Keyframes",
        actionIcon: "movie",
      });
    }

    // Add detected forensic signals as signal artifacts
    (scan.evidence || []).forEach((ev, idx) => {
      evidenceArtifacts.push({
        id: `art-${incidentId}-sig-${idx + 1}`,
        name: `${ev.title.slice(0, 30)}.sig`,
        type: "Forensic Signal",
        size: ev.severity.toUpperCase(),
        actionIcon: "fingerprint",
      });
    });

    // Build realistic AI recommendations from actual scan data
    const aiRecommendations: string[] = [];
    if (scan.recommendation) {
      aiRecommendations.push(scan.recommendation);
    }
    if (scan.externalIntel && scan.externalIntel.maliciousCount > 0) {
      aiRecommendations.push(
        `Block flagged domain / URL across firewall (${scan.externalIntel.maliciousCount} security engines confirmed malicious).`
      );
    }
    aiRecommendations.push("Coordinate with SOC Tier 2 to quarantine associated session and notify affected endpoints.");

    const now = new Date();
    const formattedTimestamp = now.toISOString().replace("T", " ").slice(0, 19);

    const newIncidentDetail: IncidentDetail = {
      id: incidentId,
      scanId: scan.id,
      timestamp: formattedTimestamp,
      threatType: scan.headline || "Reported Threat Incident",
      platform: scan.modality ? scan.modality.toUpperCase() : "Web Client",
      severity: scan.severity as IncidentSeverity,
      status: "investigating",
      analyst: "SOC Triage Queue",
      description: scan.targetInput ? scan.targetInput.slice(0, 120) : "Threat incident created from forensic scan.",
      riskOverview: scan.aiExplanation || scan.recommendation || `Risk Score: ${scan.riskScore}/100 with ${scan.severity.toUpperCase()} threat severity.`,
      evidenceArtifacts,
      aiRecommendations,
    };

    const newIncidentItem: IncidentItem = {
      id: newIncidentDetail.id,
      scanId: scan.id,
      timestamp: newIncidentDetail.timestamp,
      threatType: newIncidentDetail.threatType,
      platform: newIncidentDetail.platform,
      severity: newIncidentDetail.severity,
      status: newIncidentDetail.status,
      analyst: newIncidentDetail.analyst,
      description: newIncidentDetail.description,
    };

    // Prepend to incidents list
    const currentList = getStoredIncidents();
    const updatedList = [newIncidentItem, ...currentList.filter((i) => i.id !== incidentId)];
    saveStoredIncidents(updatedList);

    // Save detail
    inMemoryDetails.set(incidentId, newIncidentDetail);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(`${STORAGE_INCIDENT_PREFIX}${incidentId}`, JSON.stringify(newIncidentDetail));
      } catch (_) {}
    }

    return newIncidentDetail;
  }
}

export const incidentService: IIncidentService = new CentralizedIncidentService();

