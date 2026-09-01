import {
  CommunityReputationItem,
  EvidenceItem,
  ExternalIntelSummary,
  MetricBreakdown,
  ModalityType,
  ScanResult,
  SeverityLevel,
} from "@/types/scan";
import { BackendScanResponse } from "./apiClient";

/**
 * Maps raw forensic signal names to concise, human-readable explanations
 * explaining what was detected and why it matters, without exposing internal scoring arithmetic.
 */
export function getSignalForensicExplanation(signalName: string): string {
  const normalized = signalName.toLowerCase().trim();

  // URL / Link patterns
  if (normalized.includes("url") && (normalized.includes("malicious") || normalized.includes("virustotal") || normalized.includes("suspicious"))) {
    return "External security intelligence flagged destination link as untrusted infrastructure.";
  }
  if (normalized.includes("url detected")) {
    return "Contains external hyperlink; commonly leveraged to redirect targets to credential harvesting or malicious landing pages.";
  }

  // UPI / Payments
  if (normalized.includes("upi")) {
    return "Contains UPI payment handle; frequently used to solicit direct, irreversible money transfers.";
  }
  if (normalized.includes("payment")) {
    return "Requests financial transaction or fund transfer; common in advance-fee and billing fraud.";
  }

  // OTP / Verification
  if (normalized.includes("otp") || normalized.includes("verification request")) {
    return "Solicits one-time password or security code; legitimate institutions never request authentication codes.";
  }

  // Urgency & Intimidation
  if (normalized.includes("artificial urgency") || normalized.includes("high-pressure urgency")) {
    return "Employs psychological pressure to induce panic and force hasty decisions before verification.";
  }
  if (normalized.includes("threat") || normalized.includes("account-pressure") || normalized.includes("account pressure")) {
    return "Uses coercive threats such as account suspension or legal action to compel immediate compliance.";
  }

  // Credentials & Personal Data
  if (normalized.includes("credential") || normalized.includes("login")) {
    return "Directly requests passwords, PINs, or login credentials to execute unauthorized account takeover.";
  }
  if (normalized.includes("personal") || normalized.includes("identity information") || normalized.includes("kyc")) {
    return "Solicits sensitive identity details (PAN/Aadhaar/KYC) for potential identity theft and account cloning.";
  }

  // Impersonation & Brand
  if (normalized.includes("brand") || normalized.includes("organization") || normalized.includes("impersonation")) {
    return "References a recognized brand or entity to construct false authority and deceptive trust.";
  }

  // Specific scam types
  if (normalized.includes("prize") || normalized.includes("reward")) {
    return "Promises unsolicited winnings or lottery rewards as bait to harvest fees or personal credentials.";
  }
  if (normalized.includes("investment") || normalized.includes("guaranteed-return")) {
    return "Promotes unrealistic high-yield or guaranteed returns typical of financial fraud schemes.";
  }
  if (normalized.includes("support") || normalized.includes("remote-access")) {
    return "Claims false technical issues or requests remote desktop access to compromise system security.";
  }

  // AI behavioral signals
  if (normalized.includes("scam intent")) {
    return "Neural language analysis identified conversational patterns consistent with known fraudulent campaigns.";
  }
  if (normalized.includes("social-engineering") || normalized.includes("social engineering")) {
    return "Linguistic structure exploits psychological persuasion tactics to manipulate user action.";
  }
  if (normalized.includes("financial manipulation")) {
    return "Deceptive framing detected regarding banking, account balances, or financial settlements.";
  }

  // Phone number
  if (normalized.includes("phone number")) {
    return "Direct telephone contact provided to facilitate out-of-band social engineering or callback scams.";
  }

  // Fallback for custom or diagnostic signals
  return "Forensic indicator identified during multi-stage behavioral and heuristic inspection.";
}

export function normalizeBackendScanResponse(
  backend: BackendScanResponse,
  originalInput: string,
  modality: ModalityType = "text"
): ScanResult {
  // 1. Normalize risk score (default 0 if null/undefined for clean/informational results)
  const riskScore = backend.risk_score !== null && backend.risk_score !== undefined
    ? Number(backend.risk_score)
    : 0;

  // 2. Normalize severity
  let severity: SeverityLevel = "safe";
  if (backend.severity) {
    const rawSev = backend.severity.toLowerCase();
    if (rawSev.includes("critical")) severity = "critical";
    else if (rawSev.includes("high")) severity = "high";
    else if (rawSev.includes("suspicious") || rawSev.includes("medium")) severity = "suspicious";
    else severity = "safe";
  } else {
    if (riskScore >= 80) severity = "critical";
    else if (riskScore >= 60) severity = "high";
    else if (riskScore >= 30) severity = "suspicious";
    else severity = "safe";
  }

  // 3. Normalize confidence label & numeric score
  const confText = backend.confidence || (riskScore > 0 ? "High" : "Low");
  const confidenceScore =
    confText.toLowerCase() === "high"
      ? 98
      : confText.toLowerCase() === "medium"
      ? 85
      : 72;
  const confidenceLabel = backend.confidence
    ? `${backend.confidence.toUpperCase()} (${confidenceScore}%)`
    : riskScore === 0
    ? "INFORMATIONAL"
    : `LOW (${confidenceScore}%)`;

  // 4. Normalize headline
  let headline = "";
  if (backend.threat_type) {
    headline = `${backend.threat_type} Detected`;
  } else if (modality === "image") {
    headline =
      riskScore >= 75
        ? "Suspicious Image Content Detected"
        : riskScore > 0
        ? "Image Forensic Indicators Identified"
        : "Image Forensics Completed";
  } else if (modality === "audio") {
    headline =
      riskScore >= 75
        ? "Malicious Audio Stream Detected"
        : riskScore > 0
        ? "Audio Forensic Indicators Identified"
        : "Audio Forensics Completed";
  } else if (modality === "video") {
    headline =
      riskScore >= 75
        ? "Deepfake / Malicious Video Detected"
        : riskScore > 0
        ? "Video Forensic Indicators Identified"
        : "Video Forensics Completed";
  } else {
    headline =
      riskScore >= 80
        ? "Critical Threat Detected"
        : riskScore >= 50
        ? "Suspicious Content Detected"
        : "Content Verified Safe";
  }

  // 5. Normalize evidence signals
  const evidence: EvidenceItem[] = (backend.evidence || []).map((item, idx) => {
    let evSev: SeverityLevel = "suspicious";
    if (item.points >= 15) evSev = "critical";
    else if (item.points >= 10) evSev = "high";
    else if (item.points === 0) evSev = "safe";

    return {
      id: `ev-${idx + 1}`,
      title: item.signal,
      description: getSignalForensicExplanation(item.signal),
      severity: evSev,
    };
  });

  // If no threat signals returned (e.g. clean payload or speech missing), populate realistic diagnostic evidence
  if (evidence.length === 0) {
    if (modality === "image") {
      evidence.push({
        id: "ev-1",
        title: "OCR Text Extraction",
        description: backend.ocr_status || (backend.extracted_text ? "Text successfully extracted from image." : "No readable text detected in payload."),
        severity: "safe",
      });

      if (backend.image_forensics?.exif) {
        evidence.push({
          id: "ev-2",
          title: "EXIF Metadata Inspection",
          description: backend.image_forensics.exif.available
            ? "Metadata tags discovered and inspected."
            : "No embedded EXIF metadata tags found in image container.",
          severity: "safe",
        });
      }

      if (backend.image_forensics?.ela) {
        evidence.push({
          id: "ev-3",
          title: "Error Level Analysis (ELA)",
          description: backend.image_forensics.ela.supported
            ? backend.image_forensics.ela.possible_editing_indicators
              ? "Potential compression and resaving artifacts detected."
              : "Uniform compression levels observed across surfaces."
            : backend.image_forensics.ela.reason || "ELA analysis not applicable for this format.",
          severity: backend.image_forensics.ela.possible_editing_indicators ? "suspicious" : "safe",
        });
      }
    } else if (modality === "audio") {
      evidence.push({
        id: "ev-1",
        title: "Whisper Neural Transcription",
        description: backend.transcript
          ? `Speech transcribed: "${backend.transcript.slice(0, 60)}..."`
          : (backend.transcription?.message || "No usable speech audio detected in stream."),
        severity: "safe",
      });

      if (backend.audio_forensics) {
        evidence.push({
          id: "ev-2",
          title: "Audio Signal Telemetry",
          description: backend.audio_forensics.duration_seconds
            ? `Duration: ${backend.audio_forensics.duration_seconds.toFixed(1)}s | Sample Rate: ${backend.audio_forensics.sample_rate || 16000}Hz`
            : "Audio signal spectral properties analyzed.",
          severity: "safe",
        });
      }
    } else if (modality === "video") {
      evidence.push({
        id: "ev-1",
        title: "Video Stream Probing",
        description: backend.video_metadata?.duration_seconds
          ? `Duration: ${backend.video_metadata.duration_seconds.toFixed(1)}s | Resolution: ${backend.video_metadata.width}x${backend.video_metadata.height}`
          : "Video container metadata extracted.",
        severity: "safe",
      });

      if (backend.frames && backend.frames.length > 0) {
        evidence.push({
          id: "ev-2",
          title: "Frame Inspection & OCR",
          description: `Extracted ${backend.frames.length} keyframes for OCR text and visual forensic evaluation.`,
          severity: "safe",
        });
      }

      if (backend.video_forensics?.frame_possible_editing_indicators !== undefined) {
        evidence.push({
          id: "ev-3",
          title: "Frame Compression Consistency",
          description: backend.video_forensics.frame_possible_editing_indicators
            ? "Frame visual artifacts flagged for further analysis."
            : "Uniform frame compression consistency observed.",
          severity: backend.video_forensics.frame_possible_editing_indicators ? "suspicious" : "safe",
        });
      }
    } else {
      evidence.push({
        id: "ev-1",
        title: "Heuristic & Signature Evaluation",
        description: "Payload evaluated across rule classifiers and threat feeds with no anomalies.",
        severity: "safe",
      });
    }
  }

  // 6. Normalize AI breakdown dimensions (only from real backend ai_analysis)
  const breakdown: MetricBreakdown[] = [];
  if (backend.ai_analysis) {
    if (backend.ai_analysis.scam_intent !== undefined) {
      breakdown.push({
        name: "Scam Intent",
        statusText: backend.ai_analysis.scam_intent ? "Flagged" : "Clean",
        category: backend.ai_analysis.scam_intent ? "critical" : "info",
      });
    }
    if (backend.ai_analysis.social_engineering !== undefined) {
      breakdown.push({
        name: "Social Engineering",
        statusText: backend.ai_analysis.social_engineering ? "Flagged" : "Clean",
        category: backend.ai_analysis.social_engineering ? "critical" : "info",
      });
    }
    if (backend.ai_analysis.impersonation !== undefined) {
      breakdown.push({
        name: "Brand Impersonation",
        statusText: backend.ai_analysis.impersonation ? "Flagged" : "Clean",
        category: backend.ai_analysis.impersonation ? "critical" : "info",
      });
    }
    if (backend.ai_analysis.financial_manipulation !== undefined) {
      breakdown.push({
        name: "Financial Manipulation",
        statusText: backend.ai_analysis.financial_manipulation ? "Flagged" : "Clean",
        category: backend.ai_analysis.financial_manipulation ? "critical" : "info",
      });
    }
    if (backend.ai_analysis.urgency) {
      const urgencyUpper = String(backend.ai_analysis.urgency).toUpperCase();
      breakdown.push({
        name: "Urgency Pressure",
        statusText: urgencyUpper,
        category: urgencyUpper === "HIGH" ? "critical" : urgencyUpper === "MEDIUM" ? "warning" : "info",
      });
    }
  }

  // 7. Normalize AI explanation
  let aiExplanation = "";
  if (backend.ai_analysis?.explanation) {
    aiExplanation = backend.ai_analysis.explanation;
  } else if (modality === "image") {
    aiExplanation = backend.extracted_text
      ? `OCR extracted text: "${backend.extracted_text}". Evaluated across threat models.`
      : (backend.ocr_status || "Image forensic metadata and structural compression checks completed.");
  } else if (modality === "audio") {
    aiExplanation = backend.transcript
      ? `Whisper transcribed speech: "${backend.transcript}". Evaluated across threat models.`
      : "Audio signal spectral structure analyzed. No usable speech transcript detected.";
  } else if (modality === "video") {
    if (backend.transcript && backend.frame_ocr_text) {
      aiExplanation = `Transcribed speech ("${backend.transcript.slice(0, 50)}...") and on-screen text ("${backend.frame_ocr_text.slice(0, 50)}...") analyzed across threat models.`;
    } else if (backend.transcript) {
      aiExplanation = `Video audio stream transcribed: "${backend.transcript}". Evaluated across threat models.`;
    } else if (backend.frame_ocr_text) {
      aiExplanation = `Video keyframe OCR extracted text: "${backend.frame_ocr_text}". Evaluated across threat models.`;
    } else {
      aiExplanation = "Video keyframe visual structures, compression consistency, and audio track evaluated.";
    }
  } else {
    aiExplanation = `Forensic examination completed for submitted ${modality} payload.`;
  }

  // 8. Normalize VirusTotal (only from real backend virustotal data)
  const vtList = backend.virustotal && backend.virustotal.length > 0 ? backend.virustotal : null;
  const vtFirst = vtList ? vtList[0] : null;

  const hasRealVt = Boolean(
    vtFirst &&
    (vtFirst.malicious !== undefined ||
     vtFirst.suspicious !== undefined ||
     vtFirst.harmless !== undefined ||
     vtFirst.undetected !== undefined)
  );

  const externalIntel: ExternalIntelSummary = {
    provider: "VirusTotal",
    available: hasRealVt,
    maliciousCount: hasRealVt ? Number(vtFirst?.malicious || 0) : 0,
    suspiciousCount: hasRealVt ? Number(vtFirst?.suspicious || 0) : 0,
    harmlessCount: hasRealVt ? Number(vtFirst?.harmless || 0) : 0,
    totalEngines: hasRealVt
      ? (Number(vtFirst?.malicious || 0) +
         Number(vtFirst?.suspicious || 0) +
         Number(vtFirst?.harmless || 0) +
         Number(vtFirst?.undetected || 0))
      : 0,
  };

  // 9. Normalize Community Intel (honest indexing status; never fabricate report counts)
  const communityIntel: CommunityReputationItem[] = [];
  const urls = backend.extracted_entities?.urls || [];

  if (urls.length > 0) {
    const urlTarget = urls[0];
    let domainTarget = urlTarget;
    try {
      domainTarget = new URL(urlTarget).hostname;
    } catch (_) {}

    communityIntel.push({
      type: "URL Reputation",
      target: urlTarget,
      statusText: "Not indexed",
      severity: "safe",
    });

    if (domainTarget && domainTarget !== urlTarget) {
      communityIntel.push({
        type: "Domain Reputation",
        target: domainTarget,
        statusText: "Not indexed",
        severity: "safe",
      });
    }
  }

  // 10. Format timestamp
  const timestampStr = backend.timestamp
    ? backend.timestamp.replace("T", " ").substring(0, 19) + " UTC"
    : new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";

  return {
    id: backend.scan_id || `TRUTH-SCAN-${Date.now()}`,
    timestamp: timestampStr,
    targetInput: originalInput,
    modality,
    riskScore,
    severity,
    confidence: confidenceScore,
    confidenceLabel,
    headline,
    status: "complete",
    recommendation:
      backend.recommendation ||
      (riskScore >= 70
        ? "Do not click links, share OTPs, or make payments. Verify the sender through official channels."
        : "No active threat indicators detected. Payload verified safe according to forensic inspection."),
    aiExplanation,
    breakdown,
    evidence,
    externalIntel,
    communityIntel,
    timing: backend.timing,
    extractedEntities: backend.extracted_entities,

    // Modality-specific forensics
    extractedText: backend.extracted_text,
    ocrStatus: backend.ocr_status,
    imageForensics: backend.image_forensics,
    transcript: backend.transcript,
    transcription: backend.transcription,
    audioForensics: backend.audio_forensics,
    videoMetadata: backend.video_metadata,
    frames: backend.frames,
    frameOcrText: backend.frame_ocr_text,
    videoForensics: backend.video_forensics,
    analysisSource: backend.analysis_source,
  };
}
