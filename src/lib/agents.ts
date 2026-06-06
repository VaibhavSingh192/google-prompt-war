import Anthropic from "@anthropic-ai/sdk";
import type {
  AnalyzeRequest,
  BurnoutRisk,
  HealthAnalysis,
  TriggerAnalysis,
  WellnessPlan,
} from "@/types";

const MODEL = "claude-opus-4-8";
const MAX_TOKENS = 1024;

function getClient(): Anthropic {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  return new Anthropic({ apiKey });
}

function extractJSON(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match?.[0]) return null;
  return JSON.parse(match[0]);
}

const MOOD_LABELS: Record<number, string> = {
  1: "Very Stressed",
  2: "Anxious",
  3: "Neutral",
  4: "Okay",
  5: "Good",
};

export async function runMoodAnalyzer(req: AnalyzeRequest): Promise<HealthAnalysis> {
  const client = getClient();
  const prompt = `You are an empathetic mental wellness analyst for student mental health.

A student preparing for ${req.examType} reports:
- Mood: ${req.moodScore}/5 (${MOOD_LABELS[req.moodScore] ?? "Unknown"})
- Triggers: ${req.triggers.length > 0 ? req.triggers.join(", ") : "None"}
- Reflection: "${req.reflection || "Not provided"}"

Return ONLY valid JSON (no markdown):
{
  "emotionalState": "concise phrase",
  "burnoutRisk": "low|medium|high",
  "burnoutScore": 0-100,
  "primaryEmotion": "single word",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "affirmation": "warm 1-2 sentence affirmation for a ${req.examType} student"
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  let parsed: unknown;
  try {
    parsed = extractJSON(text);
  } catch {
    parsed = null;
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("emotionalState" in parsed) ||
    !("burnoutRisk" in parsed)
  ) {
    throw new Error("Mood analyzer returned invalid JSON");
  }

  return parsed as HealthAnalysis;
}

interface TriggerAnalystInput {
  examType: string;
  triggers: string[];
  emotionalState: string;
  moodScore: number;
}

export async function runTriggerAnalyst(input: TriggerAnalystInput): Promise<TriggerAnalysis> {
  if (input.triggers.length === 0) {
    return {
      rankedTriggers: [],
      primaryTrigger: null,
      overallMessage:
        "No specific triggers identified. General exam pressure is still real — your feelings are valid.",
    };
  }

  const client = getClient();
  const prompt = `You are a stress expert for students preparing for ${input.examType}.

Active triggers: ${input.triggers.join(", ")}
Emotional state: "${input.emotionalState}" (mood ${input.moodScore}/5)

Return ONLY valid JSON (no markdown). Include ALL ${input.triggers.length} triggers sorted by severityScore descending:
{
  "rankedTriggers": [
    {
      "trigger": "exact name",
      "severity": "low|medium|high",
      "severityScore": 0-100,
      "rootCause": "1 sentence",
      "impact": "1 sentence"
    }
  ],
  "primaryTrigger": "most impactful trigger name",
  "overallMessage": "empathetic 1-sentence pattern observation"
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  let parsed: unknown;
  try {
    parsed = extractJSON(text);
  } catch {
    parsed = null;
  }

  if (!parsed || typeof parsed !== "object" || !("rankedTriggers" in parsed)) {
    throw new Error("Trigger analyst returned invalid JSON");
  }

  return parsed as TriggerAnalysis;
}

interface WellnessCoachInput {
  examType: string;
  moodScore: number;
  burnoutRisk: BurnoutRisk;
  triggers: string[];
  emotionalState: string;
}

export async function runWellnessCoach(input: WellnessCoachInput): Promise<WellnessPlan> {
  const client = getClient();
  const prompt = `You are a compassionate wellness coach for competitive exam students.

Student: ${input.examType} | Mood ${input.moodScore}/5 | Burnout: ${input.burnoutRisk}
Emotional state: "${input.emotionalState}"
Top triggers: ${input.triggers.slice(0, 4).join(", ") || "None"}

Return ONLY valid JSON (no markdown):
{
  "immediateAction": {
    "title": "short title",
    "steps": ["step 1", "step 2", "step 3"],
    "duration": "X minutes"
  },
  "studyStrategy": {
    "title": "title",
    "tips": ["tip 1", "tip 2", "tip 3"]
  },
  "selfCare": {
    "title": "title",
    "activities": ["activity 1", "activity 2", "activity 3"]
  },
  "motivationalMessage": "powerful 2-3 sentence message",
  "weeklyGoal": "one achievable goal this week"
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  let parsed: unknown;
  try {
    parsed = extractJSON(text);
  } catch {
    parsed = null;
  }

  if (!parsed || typeof parsed !== "object" || !("immediateAction" in parsed)) {
    throw new Error("Wellness coach returned invalid JSON");
  }

  return parsed as WellnessPlan;
}
