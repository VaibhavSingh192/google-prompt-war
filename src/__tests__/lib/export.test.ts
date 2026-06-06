import { describe, it, expect } from "vitest";
import { generateReport } from "@/lib/export";
import type { AnalyzeResponse, AnalyzeRequest } from "@/types";

const req: AnalyzeRequest = {
  examType: "JEE",
  moodScore: 2,
  triggers: ["Heavy study load", "Fear of failure"],
  reflection: "Feeling overwhelmed",
};

const res: AnalyzeResponse = {
  health: {
    emotionalState: "Anxious and overwhelmed",
    burnoutRisk: "high",
    burnoutScore: 78,
    primaryEmotion: "anxious",
    insights: ["Insight one.", "Insight two."],
    affirmation: "You are doing great.",
  },
  triggers: {
    rankedTriggers: [
      { trigger: "Fear of failure", severity: "high", severityScore: 85, rootCause: "Root", impact: "Impact" },
    ],
    primaryTrigger: "Fear of failure",
    overallMessage: "Pressure is high.",
  },
  wellness: {
    immediateAction: { title: "Breathe", steps: ["Step 1", "Step 2"], duration: "5 minutes" },
    studyStrategy: { title: "Pomodoro", tips: ["Tip 1"] },
    selfCare: { title: "Rest", activities: ["Activity 1"] },
    motivationalMessage: "You can do this.",
    weeklyGoal: "Sleep 7 hours.",
  },
};

describe("generateReport", () => {
  it("includes the exam type", () => {
    expect(generateReport(req, res)).toContain("JEE");
  });

  it("includes burnout risk", () => {
    expect(generateReport(req, res)).toContain("HIGH");
  });

  it("includes the motivational message", () => {
    expect(generateReport(req, res)).toContain("You can do this.");
  });

  it("includes crisis numbers", () => {
    const report = generateReport(req, res);
    expect(report).toContain("9152987821");
    expect(report).toContain("1860-2662-345");
  });
});
