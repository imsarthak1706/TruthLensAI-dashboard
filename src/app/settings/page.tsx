"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Public Settings Route - Access Restricted.
 *
 * System settings, API credentials, and administrative controls are restricted
 * from public access. The complete Settings implementation is safely preserved in
 * `@/components/admin/AdminSettingsPanel` for future authenticated admin/RBAC integration.
 */
export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <Card className="p-8 border-error/30 bg-surface-container-lowest text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-error/10 border border-error/30 flex items-center justify-center text-error shadow-[0_0_20px_rgba(255,84,73,0.2)]">
          <Icon name="lock" className="text-3xl" fill={true} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-error/10 border border-error/20 text-error font-code-sm text-xs uppercase tracking-widest font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            403 Forbidden
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface">
            Access Restricted
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            System configuration, API key generation, webhook settings, and administrative telemetry controls are restricted to authorized Security Operations Center (SOC) personnel.
          </p>
        </div>

        <div className="p-4 rounded bg-surface-container-low border border-outline-variant/40 text-left space-y-2">
          <div className="flex items-center gap-2 text-on-surface font-semibold text-xs font-label-caps uppercase tracking-wider">
            <Icon name="verified_user" className="text-primary text-base" />
            SOC Security Policy Notice
          </div>
          <p className="text-xs font-code-sm text-on-surface-variant leading-relaxed">
            Public user sessions cannot modify threat retention policies or inspect production API tokens. Elevated role authentication is required to access this panel.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/overview">
            <Button variant="primary" size="md" icon="dashboard">
              Return to Security Overview
            </Button>
          </Link>
          <Link href="/scan/new">
            <Button variant="secondary" size="md" icon="security">
              New Threat Scan
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
