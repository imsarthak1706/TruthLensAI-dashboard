export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'suspicious' | 'safe';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface IncidentArtifact {
  id: string;
  name: string;
  type: string;
  size: string;
  actionIcon: string;
}

export interface IncidentItem {
  id: string;
  timestamp: string;
  threatType: string;
  platform: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  analyst?: string;
  description?: string;
  scanId?: string;
}

export interface IncidentDetail extends IncidentItem {
  riskOverview: string;
  evidenceArtifacts: IncidentArtifact[];
  aiRecommendations: string[];
}

export interface IncidentKpis {
  total: number;
  critical: number;
  investigating: number;
  resolved: number;
  weeklyChangePercent: number;
  resolutionRateChangePercent: number;
}
