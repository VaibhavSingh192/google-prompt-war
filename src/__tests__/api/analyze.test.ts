import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/agents", () => ({
  runMoodAnalyzer: vi.fn(),
  runTriggerAnalyst: vi.fn(),
  runWellnessCoach: vi.fn(),
}));

vi.mock("@/lib/ratelimit", () => ({
  apiRateLimiter: { check: vi.fn().mockReturnValue(true) },
}));

import { POST } from "@/app/api/analyze/route";
import { runMoodAnalyzer, runTriggerAnalyst, runWellnessCoach } from "@/lib/agents";
import { apiRateLimiter } from "@/lib/ratelimit";

const mockHealth = {
  emotionalState: "stressed",
  burnoutRisk: "medium" as const,
  burnoutScore: 60,
  primaryEmotion: "anxious",
  insights: ["i1"],
  affirmation: "affirmation",
};
const mockTriggers = { rankedTriggers: [], primaryTrigger: null, overallMessage: "ok" };
const mockWellness = {
  immediateAction: { title: "t", steps: [], duration: "5m" },
  studyStrategy: { title: "t", tips: [] },
  selfCare: { title: "t", activities: [] },
  motivationalMessage: "msg",
  weeklyGoal: "goal",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(apiRateLimiter.check).mockReturnValue(true);
  vi.mocked(runMoodAnalyzer).mockResolvedValue(mockHealth);
  vi.mocked(runTriggerAnalyst).mockResolvedValue(mockTriggers);
  vi.mocked(runWellnessCoach).mockResolvedValue(mockWellness);
});

function makeRequest(body: unknown, ip = "127.0.0.1") {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analyze", () => {
  it("returns 200 with valid input", async () => {
    const req = makeRequest({ examType: "JEE", moodScore: 3, triggers: [], reflection: "" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("health");
    expect(data).toHaveProperty("triggers");
    expect(data).toHaveProperty("wellness");
  });

  it("returns 400 when moodScore is out of range", async () => {
    const req = makeRequest({ examType: "JEE", moodScore: 6, triggers: [], reflection: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when examType is missing", async () => {
    const req = makeRequest({ moodScore: 3, triggers: [], reflection: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(apiRateLimiter.check).mockReturnValue(false);
    const req = makeRequest({ examType: "JEE", moodScore: 3, triggers: [], reflection: "" });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("runs trigger analyst and wellness coach after mood analyzer", async () => {
    const req = makeRequest({
      examType: "NEET",
      moodScore: 2,
      triggers: ["Fear of failure"],
      reflection: "stressed",
    });
    await POST(req);
    expect(runTriggerAnalyst).toHaveBeenCalledOnce();
    expect(runWellnessCoach).toHaveBeenCalledOnce();
  });
});
