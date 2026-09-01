export interface BenchmarkMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  samplesCount: number;
  totalScam: number;
  totalBenign: number;
  tp: number;
  tn: number;
  fp: number;
  fn: number;
}

export interface LanguageBenchmarkMetric {
  language: string;
  samples: number;
  totalScam: number;
  totalBenign: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  tp: number;
  tn: number;
  fp: number;
  fn: number;
}

export interface ConfusionMatrixData {
  actualScamPredictedScam: number; // TP = 54
  actualScamPredictedBenign: number; // FN = 6
  actualBenignPredictedScam: number; // FP = 0
  actualBenignPredictedBenign: number; // TN = 60
}

export interface BenchmarkErrorItem {
  id: string;
  language: string;
  expected: "SCAM" | "BENIGN";
  predicted: "SCAM" | "BENIGN";
  score: number;
  severity: string;
  threatType: string;
  text: string;
  analysisReason: string;
}

export interface BenchmarkProvenance {
  benchmarkName: string;
  datasetPath: string;
  evaluationPipeline: string;
  productionThreshold: number;
  evaluationTimestamp: string;
  languages: string[];
  balanceDescription: string;
}

export interface BenchmarkEvaluationData {
  provenance: BenchmarkProvenance;
  overall: BenchmarkMetrics;
  byLanguage: Record<"english" | "hindi" | "hinglish", LanguageBenchmarkMetric>;
  confusionMatrix: ConfusionMatrixData;
  errors: BenchmarkErrorItem[];
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
