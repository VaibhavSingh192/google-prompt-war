export type BurnoutRisk = "low" | "medium" | "high";
export type TriggerSeverity = "low" | "medium" | "high";

export interface AnalyzeRequest {
  examType: string;
  moodScore: number;   // 1–5
  triggers: string[];
  reflection: string;
}

export interface HealthAnalysis {
  emotionalState: string;
  burnoutRisk: BurnoutRisk;
  burnoutScore: number;        // 0–100
  primaryEmotion: string;
  insights: string[];
  affirmation: string;
}

export interface RankedTrigger {
  trigger: string;
  severity: TriggerSeverity;
  severityScore: number;       // 0–100
  rootCause: string;
  impact: string;
}

export interface TriggerAnalysis {
  rankedTriggers: RankedTrigger[];
  primaryTrigger: string | null;
  overallMessage: string;
}

export interface WellnessPlan {
  immediateAction: {
    title: string;
    steps: string[];
    duration: string;
  };
  studyStrategy: {
    title: string;
    tips: string[];
  };
  selfCare: {
    title: string;
    activities: string[];
  };
  motivationalMessage: string;
  weeklyGoal: string;
}

export interface AnalyzeResponse {
  health: HealthAnalysis;
  triggers: TriggerAnalysis;
  wellness: WellnessPlan;
}

export interface MoodHistoryEntry {
  date: string;         // YYYY-MM-DD
  score: number;        // 1–5
  exam: string;
  burnoutRisk: BurnoutRisk | "unknown";
  timestamp: number;
}

export type AnalysisPhase = "idle" | "mood" | "triggers" | "wellness" | "done" | "error";
