export interface PrivacySettings {
  storeThreatTelemetry: boolean;
  retainRawScanPayloads: boolean;
  retentionHours: number;
  historicalIocRetention: boolean;
}

export interface ApiKeyData {
  id: string;
  label: string;
  maskedKey: string;
  createdAt: string;
  webhookUrl: string;
}

export interface IntegrationService {
  id: string;
  name: string;
  icon: string;
  status: 'connected' | 'not_configured' | 'coming_soon';
  statusLabel: string;
  colorClass: string;
}
