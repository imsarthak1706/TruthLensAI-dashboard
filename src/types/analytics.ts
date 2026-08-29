export interface BenchmarkMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  samplesCount: number;
}

export interface PerformanceTimePoint {
  day: string;
  accuracy: number;
  precision: number;
  f1Score?: number;
}

export interface ModalityLatency {
  modality: string;
  latencyMs: number;
  displayValue: string;
  barPercentage: number;
  colorClass: string;
}

export interface ThreatDistribution {
  name: string;
  percentage: number;
  color: string;
}

export interface ModalityMetricCard {
  modality: string;
  icon: string;
  detectionRate: string;
  medianTime: string;
  colorVariant: 'primary' | 'secondary' | 'tertiary' | 'error';
}
