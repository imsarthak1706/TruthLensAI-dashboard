import { ScanResult, CommunityReputationItem, SeverityLevel } from "@/types/scan";
import { communityService } from "@/services/communityService";
import { CommunityIndicator } from "@/types/community";

export type CommunityConsensusStatus = "indexed" | "not_indexed" | "no_indicator" | "error";

export interface CandidateIndicator {
  type: "URL" | "Domain";
  value: string;
}

/**
 * Normalizes a URL for comparison: lowercases host/protocol, strips trailing slashes and hash.
 */
export function normalizeUrl(raw: string): string {
  if (!raw) return "";
  try {
    const parsed = new URL(raw.trim());
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${parsed.pathname.replace(/\/$/, "")}${parsed.search}`;
  } catch (_) {
    return raw.trim().toLowerCase().replace(/\/$/, "");
  }
}

/**
 * Extracts and normalizes a domain/hostname from a URL or raw domain string.
 */
export function normalizeDomain(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.trim().toLowerCase().replace(/^https?:\/\//i, "").split("/")[0].split("?")[0].split("#")[0];
  return cleaned.replace(/^www\./i, "");
}

/**
 * Identifies all candidate URLs and domains from a scan report.
 */
export function extractCandidateIndicators(scan: ScanResult): CandidateIndicator[] {
  const candidates: CandidateIndicator[] = [];
  const seenValues = new Set<string>();

  const addCandidate = (type: "URL" | "Domain", val: string) => {
    const clean = val.trim();
    if (!clean) return;
    const key = `${type}:${clean.toLowerCase()}`;
    if (!seenValues.has(key)) {
      seenValues.add(key);
      candidates.push({ type, value: clean });
    }
  };

  // 1. Check extracted entities URLs
  if (scan.extractedEntities?.urls && Array.isArray(scan.extractedEntities.urls)) {
    for (const u of scan.extractedEntities.urls) {
      if (u && typeof u === "string" && u.trim()) {
        addCandidate("URL", u);
        const dom = normalizeDomain(u);
        if (dom && dom.includes(".")) {
          addCandidate("Domain", dom);
        }
      }
    }
  }

  // 2. Check targetInput for URLs and Domains
  const input = scan.targetInput || "";
  if (input) {
    // Find HTTP/HTTPS URLs inside target input
    const urlMatches = input.match(/https?:\/\/[^\s"'<>\\]+/gi);
    if (urlMatches) {
      for (const u of urlMatches) {
        addCandidate("URL", u);
        const dom = normalizeDomain(u);
        if (dom && dom.includes(".")) {
          addCandidate("Domain", dom);
        }
      }
    }

    // Find standalone or embedded domains in text (e.g. secure-bank-login.xyz, amazon-verify.com)
    const domainMatches = input.match(/\b([a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|xyz|io|ai|co|info|biz|me|app|dev|cloud|live|site|online|store|tech|in|us|uk|de|ca|au|ru|top|pro|club|vip|bank)\b/gi);
    if (domainMatches) {
      for (const d of domainMatches) {
        const dom = normalizeDomain(d);
        if (dom && dom.includes(".")) {
          addCandidate("Domain", dom);
        }
      }
    }

    // Fallback: If input itself looks like a domain without standard TLD list
    const trimmed = input.trim();
    if (/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:\/.*)?$/i.test(trimmed)) {
      if (trimmed.includes("/")) {
        addCandidate("URL", `http://${trimmed}`);
      }
      const dom = normalizeDomain(trimmed);
      if (dom && dom.includes(".")) {
        addCandidate("Domain", dom);
      }
    }
  }

  return candidates;
}

/**
 * Enriches a scan result with real live community consensus indicators from GET /api/community/feed.
 */
export async function enrichScanWithCommunity(
  scan: ScanResult
): Promise<{ enrichedScan: ScanResult; status: CommunityConsensusStatus }> {
  const candidates = extractCandidateIndicators(scan);

  // If no URLs or domains exist in the scan, return no_indicator state
  if (candidates.length === 0) {
    return {
      enrichedScan: {
        ...scan,
        communityIntel: [],
        communityStatus: "no_indicator",
      },
      status: "no_indicator",
    };
  }

  // Query live community feed once
  let communityList: CommunityIndicator[] = [];
  try {
    communityList = await communityService.getIndicators();
  } catch (err) {
    console.warn("Could not retrieve live community feed for enrichment:", err);
    return {
      enrichedScan: {
        ...scan,
        communityIntel: [],
        communityStatus: "error",
      },
      status: "error",
    };
  }

  const enrichedIntel: CommunityReputationItem[] = [];
  let hasAnyMatch = false;

  for (const cand of candidates) {
    if (cand.type === "URL") {
      const candNormUrl = normalizeUrl(cand.value);
      // Prefer exact match on URL indicator types first
      let match = communityList.find(
        (ci) => ci.type.toUpperCase() === "URL" && normalizeUrl(ci.indicator) === candNormUrl
      );
      if (!match) {
        match = communityList.find(
          (ci) => normalizeUrl(ci.indicator) === candNormUrl
        );
      }

      if (match && match.reportsCount > 0) {
        hasAnyMatch = true;
        const rawSev = (match.risk || "suspicious").toLowerCase();
        const sev: SeverityLevel = rawSev === "critical" || rawSev === "high" || rawSev === "suspicious" ? (rawSev as SeverityLevel) : "safe";
        enrichedIntel.push({
          type: "URL Reputation",
          target: cand.value,
          reportCount: match.reportsCount,
          riskLabel: match.risk,
          severity: sev,
          firstSeen: match.firstSeen,
          lastSeen: match.lastSeen,
        });
      } else {
        enrichedIntel.push({
          type: "URL Reputation",
          target: cand.value,
          reportCount: 0,
          severity: "safe",
          statusText: "Not indexed",
        });
      }
    } else if (cand.type === "Domain") {
      const candNormDomain = normalizeDomain(cand.value);
      // Prefer exact domain match on Domain indicator types first
      let match = communityList.find(
        (ci) => ci.type.toUpperCase() === "DOMAIN" && normalizeDomain(ci.indicator) === candNormDomain
      );
      if (!match) {
        match = communityList.find(
          (ci) => normalizeDomain(ci.indicator) === candNormDomain
        );
      }

      if (match && match.reportsCount > 0) {
        hasAnyMatch = true;
        const rawSev = (match.risk || "suspicious").toLowerCase();
        const sev: SeverityLevel = rawSev === "critical" || rawSev === "high" || rawSev === "suspicious" ? (rawSev as SeverityLevel) : "safe";
        enrichedIntel.push({
          type: "Domain Reputation",
          target: cand.value,
          reportCount: match.reportsCount,
          riskLabel: match.risk,
          severity: sev,
          firstSeen: match.firstSeen,
          lastSeen: match.lastSeen,
        });
      } else {
        enrichedIntel.push({
          type: "Domain Reputation",
          target: cand.value,
          reportCount: 0,
          severity: "safe",
          statusText: "Not indexed",
        });
      }
    }
  }

  const finalStatus: CommunityConsensusStatus = hasAnyMatch ? "indexed" : "not_indexed";

  return {
    enrichedScan: {
      ...scan,
      communityIntel: enrichedIntel,
      communityStatus: finalStatus,
    },
    status: finalStatus,
  };
}
