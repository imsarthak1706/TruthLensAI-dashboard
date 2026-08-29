import { IncidentDetail, IncidentItem, IncidentKpis } from "@/types/incident";

export const MOCK_INCIDENT_KPIS: IncidentKpis = {
  total: 42,
  critical: 8,
  investigating: 15,
  resolved: 19,
  weeklyChangePercent: 12,
  resolutionRateChangePercent: 5,
};

export const MOCK_INCIDENTS_LIST: IncidentItem[] = [
  {
    id: "INC-4092",
    timestamp: "2023-10-27 14:22:01",
    threatType: "Coordinated Phishing Campaign",
    platform: "Telegram",
    severity: "critical",
    status: "investigating",
    analyst: "J. Doe",
    description: "High-volume spike in messages containing obfuscated URLs matching known credential-harvesting patterns.",
  },
  {
    id: "INC-4091",
    timestamp: "2023-10-27 13:05:44",
    threatType: "Data Exfiltration Attempt",
    platform: "WhatsApp",
    severity: "high",
    status: "open",
    analyst: "A. Vance",
    description: "Spike in malicious smart contract deployments and drainer APK distribution.",
  },
  {
    id: "INC-4088",
    timestamp: "2023-10-26 21:14:10",
    threatType: "Suspicious Bot Activity",
    platform: "Telegram",
    severity: "medium",
    status: "resolved",
    analyst: "M. Brody",
    description: "Automated scraping bot flood targeting community intelligence feeds.",
  },
  {
    id: "INC-4085",
    timestamp: "2023-10-26 18:40:22",
    threatType: "Deepfake Executive Audio Wire Fraud",
    platform: "Email",
    severity: "critical",
    status: "investigating",
    analyst: "J. Doe",
    description: "Synthetic audio clone of CFO requesting emergency supplier wire transfer.",
  },
  {
    id: "INC-4082",
    timestamp: "2023-10-25 11:20:05",
    threatType: "UPI QR Code Impersonation",
    platform: "SMS",
    severity: "high",
    status: "resolved",
    analyst: "R. Sterling",
    description: "Modified merchant QR code payload rerouting transactions to mule account.",
  },
];

export const MOCK_INCIDENT_DETAIL_INC4092: IncidentDetail = {
  id: "INC-4092",
  timestamp: "2023-10-27 14:22 UTC",
  threatType: "Coordinated Phishing Campaign",
  platform: "Telegram",
  severity: "critical",
  status: "investigating",
  analyst: "J. Doe",
  description: "Automated detection flagged a high-volume spike in messages containing obfuscated URLs matching known credential-harvesting patterns. Originating from a network of newly registered accounts.",
  riskOverview: "Automated detection flagged a high-volume spike in messages containing obfuscated URLs matching known credential-harvesting patterns. Originating from a network of newly registered accounts.",
  evidenceArtifacts: [
    {
      id: "art-1",
      name: "malicious_payload_x1.js",
      type: "Script Analysis",
      size: "12kb",
      actionIcon: "download",
    },
    {
      id: "art-2",
      name: "screenshot_capture_04.png",
      type: "Visual Evidence",
      size: "1.2mb",
      actionIcon: "visibility",
    },
    {
      id: "art-3",
      name: "telegram_network_graph.json",
      type: "Topology Dump",
      size: "450kb",
      actionIcon: "download",
    },
  ],
  aiRecommendations: [
    "Block identified IP range (192.168.x.x - subnet 4) across firewall immediately.",
    "Issue global takedown request for primary domain secure-login-update.net.",
    "Broadcast indicator signature to Community Intelligence node network.",
  ],
};
