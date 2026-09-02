export type IndicatorType = 'URL' | 'Domain' | 'Phone' | 'UPI ID' | 'Email';
export type IndicatorRisk = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IndicatorTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  severity: 'primary' | 'error' | 'neutral';
}

export interface CommunityIndicator {
  id: string;
  indicator: string;
  type: IndicatorType;
  reportsCount: number;
  firstSeen: string;
  lastSeen?: string;
  risk: IndicatorRisk;
  status: 'Malicious' | 'Suspicious' | 'Safe';
  isBlocked?: boolean;
  timeline?: IndicatorTimelineEvent[];
}

export interface CommunityKpis {
  urlCount: string;
  urlChange: string;
  domainCount: string;
  domainChange: string;
  phoneCount: string;
  phoneChange: string;
  upiCount: string;
  upiChange: string;
  emailCount: string;
  emailChange: string;
}
