import { CommunityIndicator } from "@/types/community";

/**
 * OASIS STIX 2.1 Specification types for Indicator SDO and Bundle.
 */
export interface Stix21Indicator {
  type: "indicator";
  spec_version: "2.1";
  id: string;
  created: string;
  modified: string;
  name: string;
  description: string;
  indicator_types: string[];
  pattern: string;
  pattern_type: "stix";
  pattern_version?: string;
  valid_from: string;
  confidence: number;
  labels: string[];
}

export interface Stix21Bundle {
  type: "bundle";
  id: string;
  spec_version?: string;
  objects: Stix21Indicator[];
}

/**
 * Generates a standard RFC 4122 v4 UUID.
 */
function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Parses timestamp string safely into standard ISO 8601 UTC string.
 */
function toIsoDate(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString();
  try {
    const normalized = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T") + "Z";
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch (_) {}

  try {
    const d2 = new Date(dateStr);
    if (!isNaN(d2.getTime())) {
      return d2.toISOString();
    }
  } catch (_) {}

  return new Date().toISOString();
}

/**
 * Escapes single quotes and backslashes for STIX pattern compliance.
 */
export function escapeStixString(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/**
 * Builds standard STIX 2.1 pattern query for URL or Domain.
 */
export function buildStixPattern(indicator: string, type: string): string {
  const escaped = escapeStixString(indicator.trim());
  const normType = (type || "").toUpperCase();

  if (normType === "URL") {
    return `[url:value = '${escaped}']`;
  }
  if (normType === "DOMAIN") {
    return `[domain-name:value = '${escaped}']`;
  }
  if (normType === "IPV4" || normType === "IP") {
    return `[ipv4-addr:value = '${escaped}']`;
  }
  if (normType === "EMAIL") {
    return `[email-addr:value = '${escaped}']`;
  }

  // If type contains URL or starts with http, default to url
  if (/^https?:\/\//i.test(indicator)) {
    return `[url:value = '${escaped}']`;
  }

  // Default to domain-name
  return `[domain-name:value = '${escaped}']`;
}

/**
 * Maps risk tier deterministically to standard numeric confidence (0-100).
 */
export function getStixConfidence(riskTier?: string): number {
  const norm = (riskTier || "").toLowerCase();
  if (norm === "critical") return 95;
  if (norm === "high") return 80;
  if (norm === "suspicious" || norm === "medium") return 60;
  if (norm === "safe" || norm === "low") return 30;
  return 60;
}

/**
 * Sanitizes an indicator string for safe filesystem usage.
 */
export function sanitizeIndicatorForFilename(indicator: string): string {
  return (
    indicator
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60) || "indicator"
  );
}

/**
 * Generates a full STIX 2.1 Bundle containing one indicator SDO.
 * Strictly uses public indicator data: no chat_id, no telegram payloads, no secrets.
 */
export function generateStix21Bundle(item: CommunityIndicator): Stix21Bundle {
  const bundleId = `bundle--${generateUuid()}`;
  const indicatorId = `indicator--${generateUuid()}`;

  const created = toIsoDate(item.firstSeen);
  const modified = item.lastSeen ? toIsoDate(item.lastSeen) : created;
  const pattern = buildStixPattern(item.indicator, item.type);
  const confidence = getStixConfidence(item.risk);
  const reportCount = typeof item.reportsCount === "number" ? item.reportsCount : 1;

  const indicatorObj: Stix21Indicator = {
    type: "indicator",
    spec_version: "2.1",
    id: indicatorId,
    created,
    modified,
    name: item.indicator,
    description: `TruthLensAI Community Threat Indicator - Verified by ${reportCount} reporting nodes`,
    indicator_types: ["malicious-activity"],
    pattern,
    pattern_type: "stix",
    pattern_version: "2.1",
    valid_from: created,
    confidence,
    labels: ["phishing", "scam", "community-consensus"],
  };

  return {
    type: "bundle",
    id: bundleId,
    spec_version: "2.1",
    objects: [indicatorObj],
  };
}

/**
 * Triggers a browser download of the STIX 2.1 JSON file.
 */
export function downloadStixBundle(bundle: Stix21Bundle, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const jsonContent = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/**
 * High-level helper to generate and trigger download of a STIX 2.1 bundle for an indicator.
 */
export function exportIndicatorAsStix(indicator: CommunityIndicator): {
  success: boolean;
  filename: string;
  bundle: Stix21Bundle;
} {
  const bundle = generateStix21Bundle(indicator);
  const safeName = sanitizeIndicatorForFilename(indicator.indicator);
  const filename = `truthlens-ioc-${safeName}.stix21.json`;

  downloadStixBundle(bundle, filename);
  return { success: true, filename, bundle };
}
