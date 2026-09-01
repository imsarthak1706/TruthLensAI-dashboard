import {
  BenchmarkEvaluationData,
  BenchmarkMetrics,
  ModalityLatency,
} from "@/types/analytics";

export const VERIFIED_BENCHMARK_EVALUATION: BenchmarkEvaluationData = {
  provenance: {
    benchmarkName: "120-Sample Text Benchmark",
    datasetPath: "benchmark/text_benchmark.csv",
    evaluationPipeline: "Production FastAPI POST /api/scan (detector.py + ai_analyzer.py + risk_engine.py)",
    productionThreshold: 25,
    evaluationTimestamp: "2026-09-01T17:49:40Z",
    languages: ["English", "Hindi", "Hinglish"],
    balanceDescription: "Balanced 60 Scam / 60 Benign (20 Scam + 20 Benign per language)",
  },
  overall: {
    samplesCount: 120,
    totalScam: 60,
    totalBenign: 60,
    accuracy: 95.0,
    precision: 100.0,
    recall: 90.0,
    f1Score: 94.74,
    tp: 54,
    tn: 60,
    fp: 0,
    fn: 6,
  },
  byLanguage: {
    english: {
      language: "English",
      samples: 40,
      totalScam: 20,
      totalBenign: 20,
      accuracy: 100.0,
      precision: 100.0,
      recall: 100.0,
      f1Score: 100.0,
      tp: 20,
      tn: 20,
      fp: 0,
      fn: 0,
    },
    hindi: {
      language: "Hindi",
      samples: 40,
      totalScam: 20,
      totalBenign: 20,
      accuracy: 87.5,
      precision: 100.0,
      recall: 75.0,
      f1Score: 85.71,
      tp: 15,
      tn: 20,
      fp: 0,
      fn: 5,
    },
    hinglish: {
      language: "Hinglish",
      samples: 40,
      totalScam: 20,
      totalBenign: 20,
      accuracy: 97.5,
      precision: 100.0,
      recall: 95.0,
      f1Score: 97.44,
      tp: 19,
      tn: 20,
      fp: 0,
      fn: 1,
    },
  },
  confusionMatrix: {
    actualScamPredictedScam: 54,
    actualScamPredictedBenign: 6,
    actualBenignPredictedScam: 0,
    actualBenignPredictedBenign: 60,
  },
  errors: [
    {
      id: "HI-S-002",
      language: "Hindi",
      expected: "SCAM",
      predicted: "BENIGN",
      score: 15,
      severity: "SAFE",
      threatType: "No Strong Threat Detected",
      text: "आपका KYC समाप्त हो गया है। तुरंत इस लिंक पर क्लिक करके अपना बैंक विवरण अपडेट करें।",
      analysisReason: "Devanagari KYC expired phrasing missed English regex; AI fallback unavailable.",
    },
    {
      id: "HI-S-004",
      language: "Hindi",
      expected: "SCAM",
      predicted: "BENIGN",
      score: 15,
      severity: "SAFE",
      threatType: "No Strong Threat Detected",
      text: "आपका बिजली कनेक्शन आज काट दिया जाएगा। तुरंत भुगतान करने के लिए इस लिंक का उपयोग करें।",
      analysisReason: "Disconnection threat pattern missed; single urgency signal scored 15 (below threshold 25).",
    },
    {
      id: "HI-S-009",
      language: "Hindi",
      expected: "SCAM",
      predicted: "BENIGN",
      score: 20,
      severity: "SAFE",
      threatType: "No Strong Threat Detected",
      text: "आपका बिजली कनेक्शन आज काट दिया जाएगा। तुरंत बकाया भुगतान करें।",
      analysisReason: "Payment signal triggered (+20 pts); threat signal missed in Devanagari.",
    },
    {
      id: "HI-S-015",
      language: "Hindi",
      expected: "SCAM",
      predicted: "BENIGN",
      score: 15,
      severity: "SAFE",
      threatType: "Tech Support Scam",
      text: "तकनीकी सहायता से बोल रहा हूँ। आपके कंप्यूटर में वायरस है, यह ऐप तुरंत इंस्टॉल करें।",
      analysisReason: "Correctly identified Tech Support Scam (+15 pts), but urgency command missed.",
    },
    {
      id: "HI-S-018",
      language: "Hindi",
      expected: "SCAM",
      predicted: "BENIGN",
      score: 20,
      severity: "SAFE",
      threatType: "No Strong Threat Detected",
      text: "आपको सरकारी लाभ मिला है। इसे प्राप्त करने के लिए पंजीकरण शुल्क जमा करें।",
      analysisReason: "Triggered payment (+20 pts); government benefit prize pattern missed in Devanagari.",
    },
    {
      id: "HING-S-015",
      language: "Hinglish",
      expected: "SCAM",
      predicted: "BENIGN",
      score: 15,
      severity: "SAFE",
      threatType: "Tech Support Scam",
      text: "Main technical support se bol raha hoon. Computer mein virus hai, remote access app install karo.",
      analysisReason: "Correctly labeled Tech Support Scam (+15 pts), but scored below the 25-point threshold.",
    },
  ],
};

export interface IAnalyticsService {
  getBenchmarkEvaluation(): Promise<BenchmarkEvaluationData>;
  getBenchmarkMetrics(): Promise<BenchmarkMetrics>;
  getModalityLatency(): Promise<ModalityLatency[]>;
}

class ProductionBenchmarkAnalyticsService implements IAnalyticsService {
  async getBenchmarkEvaluation(): Promise<BenchmarkEvaluationData> {
    return VERIFIED_BENCHMARK_EVALUATION;
  }

  async getBenchmarkMetrics(): Promise<BenchmarkMetrics> {
    return VERIFIED_BENCHMARK_EVALUATION.overall;
  }

  async getModalityLatency(): Promise<ModalityLatency[]> {
    return [
      { modality: "TEXT", latencyMs: 720, displayValue: "0.72s", barPercentage: 20, colorClass: "bg-primary" },
      { modality: "IMAGE", latencyMs: 1390, displayValue: "1.39s", barPercentage: 35, colorClass: "bg-secondary" },
      { modality: "AUDIO", latencyMs: 1830, displayValue: "1.83s", barPercentage: 45, colorClass: "bg-tertiary" },
      { modality: "VIDEO", latencyMs: 4100, displayValue: "4.10s", barPercentage: 100, colorClass: "bg-error" },
    ];
  }
}

export const analyticsService: IAnalyticsService = new ProductionBenchmarkAnalyticsService();
