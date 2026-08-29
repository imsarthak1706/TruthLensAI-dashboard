import { BenchmarkMetrics, ModalityLatency, ModalityMetricCard, PerformanceTimePoint, ThreatDistribution } from "@/types/analytics";
import {
  MOCK_BENCHMARK_METRICS,
  MOCK_LATENCY_MODALITY,
  MOCK_MODALITY_CARDS,
  MOCK_PERFORMANCE_POINTS,
  MOCK_THREAT_DISTRIBUTIONS,
} from "./mock/mockAnalytics";

export interface IAnalyticsService {
  getBenchmarkMetrics(): Promise<BenchmarkMetrics>;
  getPerformanceHistory(): Promise<PerformanceTimePoint[]>;
  getModalityLatency(): Promise<ModalityLatency[]>;
  getThreatDistribution(): Promise<ThreatDistribution[]>;
  getModalityCards(): Promise<ModalityMetricCard[]>;
}

class MockAnalyticsService implements IAnalyticsService {
  async getBenchmarkMetrics(): Promise<BenchmarkMetrics> {
    await new Promise((r) => setTimeout(r, 60));
    return MOCK_BENCHMARK_METRICS;
  }

  async getPerformanceHistory(): Promise<PerformanceTimePoint[]> {
    await new Promise((r) => setTimeout(r, 80));
    return MOCK_PERFORMANCE_POINTS;
  }

  async getModalityLatency(): Promise<ModalityLatency[]> {
    await new Promise((r) => setTimeout(r, 60));
    return MOCK_LATENCY_MODALITY;
  }

  async getThreatDistribution(): Promise<ThreatDistribution[]> {
    await new Promise((r) => setTimeout(r, 60));
    return MOCK_THREAT_DISTRIBUTIONS;
  }

  async getModalityCards(): Promise<ModalityMetricCard[]> {
    await new Promise((r) => setTimeout(r, 60));
    return MOCK_MODALITY_CARDS;
  }
}

export const analyticsService: IAnalyticsService = new MockAnalyticsService();
