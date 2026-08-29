import { BenchmarkMetrics, ModalityLatency, ModalityMetricCard, PerformanceTimePoint, ThreatDistribution } from "@/types/analytics";

export const MOCK_BENCHMARK_METRICS: BenchmarkMetrics = {
  accuracy: 96.67,
  precision: 100.0,
  recall: 93.33,
  f1Score: 96.55,
  samplesCount: 120,
};

export const MOCK_PERFORMANCE_POINTS: PerformanceTimePoint[] = [
  { day: "Mon", accuracy: 94.5, precision: 96.2, f1Score: 95.3 },
  { day: "Tue", accuracy: 95.1, precision: 97.0, f1Score: 96.0 },
  { day: "Wed", accuracy: 94.8, precision: 96.5, f1Score: 95.6 },
  { day: "Thu", accuracy: 96.2, precision: 98.4, f1Score: 97.2 },
  { day: "Fri", accuracy: 97.5, precision: 100.0, f1Score: 98.7 },
  { day: "Sat", accuracy: 96.8, precision: 98.8, f1Score: 97.8 },
  { day: "Sun", accuracy: 98.2, precision: 100.0, f1Score: 99.1 },
];

export const MOCK_LATENCY_MODALITY: ModalityLatency[] = [
  { modality: "TEXT", latencyMs: 4350, displayValue: "4.35s", barPercentage: 53, colorClass: "bg-primary" },
  { modality: "IMAGE", latencyMs: 1390, displayValue: "1.39s", barPercentage: 17, colorClass: "bg-secondary" },
  { modality: "AUDIO", latencyMs: 1830, displayValue: "1.83s", barPercentage: 22, colorClass: "bg-tertiary" },
  { modality: "VIDEO", latencyMs: 8240, displayValue: "8.24s", barPercentage: 100, colorClass: "bg-error" },
];

export const MOCK_THREAT_DISTRIBUTIONS: ThreatDistribution[] = [
  { name: "Deepfake Video", percentage: 32, color: "#ffb4ab" },
  { name: "Manipulated Image", percentage: 28, color: "#c1c7d0" },
  { name: "Synthetic Audio", percentage: 24, color: "#e9638e" },
  { name: "Text Injection / Phishing", percentage: 16, color: "#6fdd78" },
];

export const MOCK_MODALITY_CARDS: ModalityMetricCard[] = [
  {
    modality: "TEXT",
    icon: "description",
    detectionRate: "99.1%",
    medianTime: "4.35s",
    colorVariant: "primary",
  },
  {
    modality: "IMAGE",
    icon: "image",
    detectionRate: "94.5%",
    medianTime: "1.39s",
    colorVariant: "secondary",
  },
  {
    modality: "AUDIO",
    icon: "graphic_eq",
    detectionRate: "88.2%",
    medianTime: "1.83s",
    colorVariant: "tertiary",
  },
  {
    modality: "VIDEO",
    icon: "videocam",
    detectionRate: "91.4%",
    medianTime: "8.24s",
    colorVariant: "error",
  },
];
