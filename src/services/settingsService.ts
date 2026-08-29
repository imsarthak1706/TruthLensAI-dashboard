import { ApiKeyData, IntegrationService, PrivacySettings } from "@/types/settings";
import { MOCK_API_KEYS, MOCK_INTEGRATIONS, MOCK_PRIVACY_SETTINGS } from "./mock/mockSettings";

export interface ISettingsService {
  getPrivacySettings(): Promise<PrivacySettings>;
  updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings>;
  getApiKeys(): Promise<ApiKeyData[]>;
  generateNewKey(label: string): Promise<ApiKeyData>;
  getIntegrations(): Promise<IntegrationService[]>;
}

class MockSettingsService implements ISettingsService {
  private privacy = { ...MOCK_PRIVACY_SETTINGS };
  private keys = [...MOCK_API_KEYS];

  async getPrivacySettings(): Promise<PrivacySettings> {
    await new Promise((r) => setTimeout(r, 50));
    return { ...this.privacy };
  }

  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    await new Promise((r) => setTimeout(r, 150));
    this.privacy = { ...this.privacy, ...settings };
    return { ...this.privacy };
  }

  async getApiKeys(): Promise<ApiKeyData[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...this.keys];
  }

  async generateNewKey(label: string): Promise<ApiKeyData> {
    await new Promise((r) => setTimeout(r, 300));
    const randomHex = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newKey: ApiKeyData = {
      id: `key-${Date.now()}`,
      label: label || "Secondary API Key",
      maskedKey: `tlai_prod_${randomHex.substring(0, 20)}`,
      createdAt: new Date().toISOString().split("T")[0],
      webhookUrl: "",
    };
    this.keys.push(newKey);
    return newKey;
  }

  async getIntegrations(): Promise<IntegrationService[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...MOCK_INTEGRATIONS];
  }
}

export const settingsService: ISettingsService = new MockSettingsService();
