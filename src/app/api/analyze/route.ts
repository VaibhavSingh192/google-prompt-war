import { NextResponse } from "next/server";
import { z } from "zod";
import { apiRateLimiter } from "@/lib/ratelimit";
import { runMoodAnalyzer, runTriggerAnalyst, runWellnessCoach } from "@/lib/agents";
import type { AnalyzeResponse } from "@/types";

const analyzeSchema = z.object({
  examType: z.string().min(1).max(80),
  moodScore: z.number().int().min(1).max(5),
  triggers: z.array(z.string().max(100)).max(10),
  reflection: z.string().max(500),
});

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getClientIp(req);
  if (!apiRateLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;

  try {
    // Phase 1: Mood Analyzer
    const health = await runMoodAnalyzer(input);

    // Phase 2: Trigger Analyst + Wellness Coach in parallel
    const [triggers, wellness] = await Promise.all([
      runTriggerAnalyst({
        examType: input.examType,
        triggers: input.triggers,
        emotionalState: health.emotionalState,
        moodScore: input.moodScore,
      }),
      runWellnessCoach({
        examType: input.examType,
        moodScore: input.moodScore,
        burnoutRisk: health.burnoutRisk,
        triggers: input.triggers,
        emotionalState: health.emotionalState,
      }),
    ]);

    const response: AnalyzeResponse = { health, triggers, wellness };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    console.error("[analyze] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
