import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {},
}));

import Anthropic from "@anthropic-ai/sdk";
import { runMoodAnalyzer, runTriggerAnalyst, runWellnessCoach } from "@/lib/agents";

const mockCreate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Anthropic.prototype as any).messages = { create: mockCreate };
});

const validHealthJSON = JSON.stringify({
  emotionalState: "anxious",
  burnoutRisk: "medium",
  burnoutScore: 60,
  primaryEmotion: "anxious",
  insights: ["i1", "i2", "i3"],
  affirmation: "You can do this",
});

const validTriggerJSON = JSON.stringify({
  rankedTriggers: [{ trigger: "t1", severity: "high", severityScore: 80, rootCause: "r", impact: "i" }],
  primaryTrigger: "t1",
  overallMessage: "msg",
});

const validWellnessJSON = JSON.stringify({
  immediateAction: { title: "Breathe", steps: ["s1"], duration: "5m" },
  studyStrategy: { title: "Pomodoro", tips: ["t1"] },
  selfCare: { title: "Rest", activities: ["a1"] },
  motivationalMessage: "Go!",
  weeklyGoal: "Sleep well",
});

describe("runMoodAnalyzer", () => {
  it("calls Claude and returns parsed health data", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: validHealthJSON }],
    });
    const result = await runMoodAnalyzer({
      examType: "JEE",
      moodScore: 2,
      triggers: ["Heavy study load"],
      reflection: "Feeling stressed",
    });
    expect(result.burnoutRisk).toBe("medium");
    expect(result.burnoutScore).toBe(60);
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("throws on invalid JSON response", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "not json" }],
    });
    await expect(
      runMoodAnalyzer({ examType: "JEE", moodScore: 2, triggers: [], reflection: "" })
    ).rejects.toThrow("Mood analyzer returned invalid JSON");
  });
});

describe("runTriggerAnalyst", () => {
  it("returns empty rankedTriggers when no triggers provided", async () => {
    const result = await runTriggerAnalyst({
      examType: "NEET",
      triggers: [],
      emotionalState: "stressed",
      moodScore: 2,
    });
    expect(result.rankedTriggers).toEqual([]);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("calls Claude and returns parsed trigger data", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: validTriggerJSON }],
    });
    const result = await runTriggerAnalyst({
      examType: "NEET",
      triggers: ["t1"],
      emotionalState: "stressed",
      moodScore: 2,
    });
    expect(result.primaryTrigger).toBe("t1");
    expect(mockCreate).toHaveBeenCalledOnce();
  });
});

describe("runWellnessCoach", () => {
  it("calls Claude and returns parsed wellness plan", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: validWellnessJSON }],
    });
    const result = await runWellnessCoach({
      examType: "CAT",
      moodScore: 3,
      burnoutRisk: "low",
      triggers: [],
      emotionalState: "neutral",
    });
    expect(result.weeklyGoal).toBe("Sleep well");
    expect(mockCreate).toHaveBeenCalledOnce();
  });
});
