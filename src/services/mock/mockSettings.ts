import { ApiKeyData, IntegrationService, PrivacySettings } from "@/types/settings";

export const MOCK_PRIVACY_SETTINGS: PrivacySettings = {
  storeThreatTelemetry: true,
  retainRawScanPayloads: false,
  retentionHours: 72,
  historicalIocRetention: true,
};

export const MOCK_API_KEYS: ApiKeyData[] = [
  {
    id: "key-1",
    label: "Primary Production Key",
    maskedKey: "tlai_prod_8f92j3n4k5m6l7o8p9q0",
    createdAt: "2023-10-01",
    webhookUrl: "https://soc.truthlens.ai/api/v1/webhook",
  },
];

export const MOCK_INTEGRATIONS: IntegrationService[] = [
  {
    id: "telegram",
    name: "Telegram Bot",
    icon: "send",
    status: "connected",
    statusLabel: "Connected",
    colorClass: "text-[#2AABEE]",
  },
  {
    id: "virustotal",
    name: "VirusTotal API",
    icon: "bug_report",
    status: "not_configured",
    statusLabel: "Not Configured",
    colorClass: "text-[#394EFF]",
  },
  {
    id: "slack",
    name: "Slack Webhook",
    icon: "tag",
    status: "coming_soon",
    statusLabel: "Coming Soon",
    colorClass: "text-white/50",
  },
];
