"use client";

import React, { useEffect, useState } from "react";
import { settingsService } from "@/services/settingsService";
import { ApiKeyData, IntegrationService, PrivacySettings } from "@/types/settings";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "privacy" | "api" | "profile" | "notifications" | "appearance"
  >("privacy");

  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationService[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [priv, keys, intg] = await Promise.all([
          settingsService.getPrivacySettings(),
          settingsService.getApiKeys(),
          settingsService.getIntegrations(),
        ]);
        setPrivacy(priv);
        setApiKeys(keys);
        setIntegrations(intg);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKey = async () => {
    const newKey = await settingsService.generateNewKey("Secondary Production Key");
    setApiKeys((prev) => [...prev, newKey]);
  };

  const handleSave = async () => {
    if (privacy) {
      await settingsService.updatePrivacySettings(privacy);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePurge = () => {
    if (confirm("Are you sure you want to purge all scan logs and telemetry history? This cannot be undone.")) {
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-stack-lg max-w-7xl mx-auto pb-16">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            System Settings &amp; Configuration
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage data privacy, telemetry sharing, API tokens, and external alert integrations.
          </p>
        </div>
      </header>

      {/* Main Grid: Settings Navigation (3 cols) + Settings Content (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Settings Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-outline-variant/50">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Configuration Menu
            </h3>
          </div>
          <nav className="flex flex-col py-2">
            {[
              { id: "privacy", label: "Privacy & Retention", icon: "shield_lock" },
              { id: "api", label: "Integrations & API", icon: "api" },
              { id: "profile", label: "Analyst Profile", icon: "person" },
              { id: "notifications", label: "Alert Notifications", icon: "notifications" },
              { id: "appearance", label: "Appearance & Theme", icon: "palette" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-left px-4 py-3 font-body-sm text-body-sm transition-colors flex items-center gap-3 ${
                    isActive
                      ? "text-primary bg-primary/10 border-l-2 border-primary font-bold"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <Icon name={tab.icon} fill={isActive} className="text-lg" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content Area */}
        <div className="lg:col-span-9 space-y-stack-lg">
          {/* Privacy & Retention Section */}
          <Card className="p-6">
            <div className="mb-6 pb-4 border-b border-outline-variant/50 flex justify-between items-start">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                  Privacy &amp; Data Retention
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Manage how your forensic scan data is stored and processed by TruthLensAI engines.
                </p>
              </div>
              <Icon name="data_usage" className="text-primary text-3xl opacity-60" />
            </div>

            <div className="space-y-6">
              {/* Toggle 1: Store Threat Telemetry */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-body-md text-body-md text-on-surface font-semibold mb-0.5">
                    Store Threat Telemetry
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Allow anonymous submission of threat patterns to Community Intelligence.
                  </p>
                </div>
                <ToggleSwitch
                  id="telemetry"
                  checked={privacy?.storeThreatTelemetry || false}
                  onChange={(val) =>
                    setPrivacy((prev) => (prev ? { ...prev, storeThreatTelemetry: val } : null))
                  }
                />
              </div>

              {/* Toggle 2: Retain Raw Scan Payloads */}
              <div className="flex items-center justify-between pt-4 border-t border-surface-variant/30">
                <div>
                  <h4 className="font-body-md text-body-md text-on-surface font-semibold mb-0.5">
                    Retain Raw Scan Payloads
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Keep original files and raw URLs for deeper forensic investigation up to 30 days.
                  </p>
                </div>
                <ToggleSwitch
                  id="raw-payloads"
                  checked={privacy?.retainRawScanPayloads || false}
                  onChange={(val) =>
                    setPrivacy((prev) => (prev ? { ...prev, retainRawScanPayloads: val } : null))
                  }
                />
              </div>

              {/* Retention Policy Info Box */}
              <div className="bg-[#0A0C10] rounded p-4 border border-outline-variant/40 flex gap-4 mt-4">
                <Icon name="info" className="text-primary text-xl shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-body-sm text-body-sm text-on-surface font-semibold mb-1">
                    Standard SOC Retention Policy
                  </h5>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    By default, processed metadata and IOCs (Indicators of Compromise) are retained indefinitely for historical correlation. Raw payloads are purged after 72 hours unless explicitly configured otherwise.
                  </p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-outline-variant/50 mt-8">
                <h4 className="font-label-caps text-label-caps text-error uppercase mb-4 tracking-wider font-bold">
                  Danger Zone
                </h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-error/30 rounded bg-error/5">
                  <div>
                    <h5 className="font-body-md text-body-md text-on-surface font-semibold">
                      Delete All History
                    </h5>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Permanently remove all scan logs, evidence artifacts, and associated metadata.
                    </p>
                  </div>
                  <button
                    onClick={handlePurge}
                    className="px-4 py-2 border border-error text-error hover:bg-error hover:text-on-error font-label-caps text-xs uppercase font-bold rounded transition-colors shrink-0"
                  >
                    Purge Data
                  </button>
                </div>
                {purgeSuccess && (
                  <p className="text-xs font-code-sm text-error mt-2">
                    ✓ All historical telemetry logs have been purged.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* API Credentials & Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* API Credentials */}
            <Card className="p-6 flex flex-col h-full justify-between">
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    API Credentials
                  </h3>
                  <Icon name="key" className="text-secondary text-xl" />
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                  Manage authentication tokens for programmatic access to the TruthLensAI engine.
                </p>

                <div className="space-y-4">
                  {apiKeys.map((k) => (
                    <div key={k.id}>
                      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1.5 block">
                        {k.label}
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="w-full bg-[#0A0C10] border border-[#30363D] rounded px-3 py-2 font-code-sm text-xs text-secondary outline-none focus:border-primary select-all"
                          readOnly
                          type="password"
                          value={k.maskedKey}
                        />
                        <button
                          onClick={() => handleCopyKey(k.maskedKey)}
                          className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors text-on-surface shrink-0"
                          title="Copy Key"
                        >
                          <Icon
                            name={copiedKey === k.maskedKey ? "check" : "content_copy"}
                            className="text-sm"
                          />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1.5 block">
                      Webhook Endpoint URL
                    </label>
                    <input
                      className="w-full bg-[#0A0C10] border border-[#30363D] rounded px-3 py-2 font-code-sm text-xs text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary"
                      placeholder="https://your-domain.com/webhook"
                      defaultValue="https://soc.truthlens.ai/api/v1/webhook"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/50">
                <button
                  onClick={handleGenerateKey}
                  className="text-primary hover:text-primary-fixed font-label-caps text-xs uppercase font-bold flex items-center gap-1 transition-colors"
                >
                  <Icon name="add" className="text-sm" /> Generate New Key
                </button>
              </div>
            </Card>

            {/* External Integrations */}
            <Card className="p-6 flex flex-col h-full justify-between">
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    External Integrations
                  </h3>
                  <Icon name="extension" className="text-secondary text-xl" />
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                  Connect third-party security pipelines to enrich threat telemetry and receive automated alerts.
                </p>

                <div className="space-y-3">
                  {integrations.map((intg) => (
                    <div
                      key={intg.id}
                      className={`p-3 border border-outline-variant rounded flex items-center justify-between hover:bg-surface-container transition-colors group cursor-pointer ${
                        intg.status === "coming_soon" ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded bg-[#0A0C10] border border-outline-variant flex items-center justify-center ${intg.colorClass}`}
                        >
                          <Icon name={intg.icon} className="text-lg" />
                        </div>
                        <div>
                          <h5 className="font-body-sm text-xs text-on-surface font-semibold">
                            {intg.name}
                          </h5>
                          <p
                            className={`font-label-caps text-[10px] uppercase mt-0.5 ${
                              intg.status === "connected"
                                ? "text-primary font-bold"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {intg.statusLabel}
                          </p>
                        </div>
                      </div>
                      <Icon
                        name={intg.status === "connected" ? "settings" : "chevron_right"}
                        className="text-on-surface-variant group-hover:text-on-surface transition-colors text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] font-code-sm text-on-surface-variant/70 mt-6 pt-4 border-t border-outline-variant/50">
                Managed by TruthLens Security Console v1.0.0
              </p>
            </Card>
          </div>

          {/* Sticky Save & Discard Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/40">
            {saveSuccess ? (
              <span className="text-xs font-code-sm text-primary flex items-center gap-1.5 animate-in fade-in">
                <Icon name="check_circle" className="text-sm" /> Configuration successfully saved!
              </span>
            ) : (
              <span className="text-xs font-code-sm text-on-surface-variant">
                Unsaved changes will apply immediately to your active SOC session.
              </span>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" size="md" onClick={() => window.location.reload()}>
                Discard Changes
              </Button>
              <Button variant="primary" size="md" icon="save" onClick={handleSave}>
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
