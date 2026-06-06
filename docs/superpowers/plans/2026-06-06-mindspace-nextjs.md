# MindSpace Next.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade Mental Wellness Tracker as a Next.js 15 full-stack app with a secure Claude AI backend, premium glassmorphism UI, and Vercel deployment.

**Architecture:** Next.js App Router handles both frontend (React Server/Client Components) and backend (API Route at `/api/analyze`). The API route proxies all Claude calls server-side so the API key never reaches the browser. Three Claude agents run in two parallel phases: Phase 1 runs Mood Analyzer alone; Phase 2 runs Trigger Analyst and Wellness Coach in parallel once mood data is available.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 3, `@anthropic-ai/sdk`, Zod, Vitest + @testing-library/react, Vercel (deployment)

---

## File Map

```
/Users/antrikshbahri/Desktop/google-prompt-war/
├── package.json                          # deps + scripts
├── next.config.ts                        # security headers, CSP
├── tailwind.config.ts                    # custom design tokens
├── tsconfig.json                         # strict TypeScript
├── .env.example                          # template (committed)
├── .gitignore                            # blocks .env.local
├── vitest.config.ts                      # test runner config
├── vitest.setup.ts                       # jest-dom matchers
├── src/
│   ├── types/index.ts                    # shared TypeScript types
│   ├── lib/
│   │   ├── agents.ts                     # 3 Claude agent functions (server-only)
│   │   ├── ratelimit.ts                  # in-memory rate limiter (server-only)
│   │   ├── storage.ts                    # localStorage mood history
│   │   └── export.ts                     # plain-text report generator
│   ├── components/
│   │   ├── MoodSelector.tsx              # emoji radiogroup
│   │   ├── TriggerGrid.tsx              # checkbox grid
│   │   ├── ProgressSteps.tsx            # 3-step analysis indicator
│   │   ├── MoodHistory.tsx              # bar chart from localStorage
│   │   ├── CrisisResources.tsx          # crisis helplines (always visible)
│   │   └── cards/
│   │       ├── SkeletonCard.tsx          # shared loading skeleton
│   │       ├── EmotionalHealthCard.tsx  # burnout meter + insights
│   │       ├── TriggerAnalysisCard.tsx  # severity bars
│   │       └── WellnessPlanCard.tsx     # action sections + motivation
│   └── app/
│       ├── globals.css                   # Tailwind base + CSS vars + animations
│       ├── layout.tsx                    # <html> + metadata + fonts
│       ├── page.tsx                      # main page (client component orchestrator)
│       └── api/
│           └── analyze/
│               └── route.ts             # POST /api/analyze (server-only)
└── src/__tests__/
    ├── lib/ratelimit.test.ts
    ├── lib/storage.test.ts
    ├── lib/export.test.ts
    ├── lib/agents.test.ts               # mock fetch, test prompt shape
    ├── api/analyze.test.ts              # integration: POST /api/analyze
    └── components/MoodSelector.test.tsx
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Remove old index.html and initialise Next.js**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
rm -f index.html README.md
npx create-next-app@15 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --yes 2>&1 | tail -20
```

Expected: `Success! Created Next.js app...`

- [ ] **Step 2: Install additional dependencies**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npm install @anthropic-ai/sdk zod
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event
```

Expected: `added N packages` with no errors.

- [ ] **Step 3: Replace `tsconfig.json` with strict config**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Replace `next.config.ts` with security headers**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self'",
            "img-src 'self' data:",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
```

- [ ] **Step 5: Replace `tailwind.config.ts` with custom design tokens**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#07111f",
          secondary: "#0d1a2e",
          card: "#101e33",
          "card-hover": "#162540",
          input: "#0d1a2e",
        },
        brand: {
          green: "#10b981",
          indigo: "#6366f1",
          amber: "#f59e0b",
          red: "#ef4444",
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      backdropBlur: { xs: "2px" },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: { provider: "v8", reporter: ["text", "json"] },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 7: Create `vitest.setup.ts`**

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 8: Create `.env.example`**

```
# Copy to .env.local and fill in your key
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 9: Add test script to `package.json`**

Open `package.json`, find `"scripts"`, add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 10: Ensure `.gitignore` blocks secrets**

Append to `.gitignore`:
```
.env.local
.env*.local
```

- [ ] **Step 11: Create `.env.local` with the API key**

```bash
echo 'ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE' > /Users/antrikshbahri/Desktop/google-prompt-war/.env.local
```

- [ ] **Step 12: Verify `next dev` starts**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npm run dev &
sleep 5
curl -s http://localhost:3000 | head -5
kill %1
```

Expected: HTML content returned (Next.js default page).

- [ ] **Step 13: Commit scaffold**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add -A
git commit -m "chore: scaffold Next.js 15 + Tailwind + Vitest"
```

---

## Task 2: Shared Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write type definitions**

```typescript
// src/types/index.ts

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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Rate Limiter

**Files:**
- Create: `src/lib/ratelimit.ts`
- Create: `src/__tests__/lib/ratelimit.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/__tests__/lib/ratelimit.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimiter } from "@/lib/ratelimit";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    // 3 requests per 60s window
    limiter = new RateLimiter({ maxRequests: 3, windowMs: 60_000 });
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it("allows requests under the limit", () => {
    expect(limiter.check("ip1")).toBe(true);
    expect(limiter.check("ip1")).toBe(true);
    expect(limiter.check("ip1")).toBe(true);
  });

  it("blocks the 4th request within window", () => {
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.check("ip1");
    expect(limiter.check("ip1")).toBe(false);
  });

  it("resets after window expires", () => {
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.check("ip1");
    vi.advanceTimersByTime(61_000);
    expect(limiter.check("ip1")).toBe(true);
  });

  it("tracks different IPs independently", () => {
    limiter.check("ip1");
    limiter.check("ip1");
    limiter.check("ip1");
    expect(limiter.check("ip1")).toBe(false);
    expect(limiter.check("ip2")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/lib/ratelimit.test.ts 2>&1 | tail -10
```

Expected: FAIL — `Cannot find module '@/lib/ratelimit'`

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/ratelimit.ts

interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
}

interface BucketEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly buckets = new Map<string, BucketEntry>();

  constructor({ maxRequests, windowMs }: RateLimiterConfig) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(key: string): boolean {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || now >= existing.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (existing.count >= this.maxRequests) return false;

    existing.count += 1;
    return true;
  }
}

// Singleton: 10 requests per 60 seconds per IP
export const apiRateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60_000 });
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/lib/ratelimit.test.ts 2>&1 | tail -10
```

Expected: `4 tests passed`

- [ ] **Step 5: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/lib/ratelimit.ts src/__tests__/lib/ratelimit.test.ts
git commit -m "feat: add in-memory rate limiter with tests"
```

---

## Task 4: Local Storage Utility

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/__tests__/lib/storage.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/__tests__/lib/storage.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { saveEntry, loadHistory, clearHistory } from "@/lib/storage";
import type { MoodHistoryEntry } from "@/types";

const entry: MoodHistoryEntry = {
  date: "2026-06-06",
  score: 3,
  exam: "JEE",
  burnoutRisk: "medium",
  timestamp: 1000,
};

describe("storage", () => {
  beforeEach(() => clearHistory());

  it("starts with empty history", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("saves and loads a single entry", () => {
    saveEntry(entry);
    expect(loadHistory()).toEqual([entry]);
  });

  it("maintains insertion order", () => {
    const e2 = { ...entry, timestamp: 2000, date: "2026-06-07" };
    saveEntry(entry);
    saveEntry(e2);
    const history = loadHistory();
    expect(history[0]).toEqual(entry);
    expect(history[1]).toEqual(e2);
  });

  it("keeps at most 30 entries (drops oldest)", () => {
    for (let i = 0; i < 32; i++) {
      saveEntry({ ...entry, timestamp: i, date: `2026-0${(i % 9) + 1}-01` });
    }
    expect(loadHistory()).toHaveLength(30);
  });

  it("ignores corrupt localStorage data", () => {
    localStorage.setItem("mindspace_history", "NOT_JSON");
    expect(loadHistory()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/lib/storage.test.ts 2>&1 | tail -10
```

Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// src/lib/storage.ts
import type { MoodHistoryEntry } from "@/types";

const STORAGE_KEY = "mindspace_history";
const MAX_ENTRIES = 30;

export function loadHistory(): MoodHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: MoodHistoryEntry): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  history.push(entry);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history.slice(-MAX_ENTRIES))
  );
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/lib/storage.test.ts 2>&1 | tail -10
```

Expected: `5 tests passed`

- [ ] **Step 5: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/lib/storage.ts src/__tests__/lib/storage.test.ts
git commit -m "feat: add localStorage history utility with tests"
```

---

## Task 5: Export Utility

**Files:**
- Create: `src/lib/export.ts`
- Create: `src/__tests__/lib/export.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/__tests__/lib/export.test.ts
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
```

- [ ] **Step 2: Run to verify it fails**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/lib/export.test.ts 2>&1 | tail -10
```

Expected: FAIL

- [ ] **Step 3: Write implementation**

```typescript
// src/lib/export.ts
import type { AnalyzeRequest, AnalyzeResponse } from "@/types";

export function generateReport(req: AnalyzeRequest, res: AnalyzeResponse): string {
  const border = "═".repeat(46);
  const divider = "─".repeat(46);
  const now = new Date().toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const lines: string[] = [
    `╔${border}╗`,
    `║${"  MINDSPACE WELLNESS REPORT".padEnd(46)}║`,
    `╚${border}╝`,
    "",
    `Generated : ${now}`,
    `Exam      : ${req.examType}`,
    `Mood      : ${req.moodScore}/5`,
    divider,
    "",
    "EMOTIONAL HEALTH",
    `State      : ${res.health.emotionalState}`,
    `Burnout    : ${res.health.burnoutRisk.toUpperCase()} (${res.health.burnoutScore}/100)`,
    `Emotion    : ${res.health.primaryEmotion}`,
    "",
    "Key Insights:",
    ...res.health.insights.map((i) => `  • ${i}`),
    "",
    `Affirmation: "${res.health.affirmation}"`,
    "",
    divider,
    "STRESS TRIGGERS",
  ];

  if (res.triggers.rankedTriggers.length > 0) {
    res.triggers.rankedTriggers.forEach((t) => {
      lines.push(`  • ${t.trigger} [${t.severity.toUpperCase()}]`);
      if (t.rootCause) lines.push(`    Root: ${t.rootCause}`);
    });
    if (res.triggers.overallMessage) {
      lines.push("", `Pattern: ${res.triggers.overallMessage}`);
    }
  } else {
    lines.push("  No specific triggers identified.");
  }

  lines.push(
    "",
    divider,
    "WELLNESS PLAN",
    "",
    `Immediate — ${res.wellness.immediateAction.title} (${res.wellness.immediateAction.duration})`,
    ...res.wellness.immediateAction.steps.map((s) => `  → ${s}`),
    "",
    `Study Strategy — ${res.wellness.studyStrategy.title}`,
    ...res.wellness.studyStrategy.tips.map((s) => `  → ${s}`),
    "",
    `Self-Care — ${res.wellness.selfCare.title}`,
    ...res.wellness.selfCare.activities.map((s) => `  → ${s}`),
    "",
    `"${res.wellness.motivationalMessage}"`,
    "",
    `Weekly Goal: ${res.wellness.weeklyGoal}`,
    "",
    divider,
    "CRISIS SUPPORT",
    "  iCall (TISS)          : 9152987821",
    "  Vandrevala Foundation : 1860-2662-345",
    "  NIMHANS               : 080-46110007",
    "  Snehi                 : 044-24640050",
    "",
    "Generated by MindSpace · PromptWars 2025",
  );

  return lines.join("\n");
}
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/lib/export.test.ts 2>&1 | tail -10
```

Expected: `4 tests passed`

- [ ] **Step 5: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/lib/export.ts src/__tests__/lib/export.test.ts
git commit -m "feat: add report export utility with tests"
```

---

## Task 6: Claude Agents (Server-Side)

**Files:**
- Create: `src/lib/agents.ts`
- Create: `src/__tests__/lib/agents.test.ts`

- [ ] **Step 1: Write failing tests (mock the Anthropic SDK)**

```typescript
// src/__tests__/lib/agents.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the SDK before importing agents
vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = {
      create: vi.fn(),
    };
  },
}));

import Anthropic from "@anthropic-ai/sdk";
import { runMoodAnalyzer, runTriggerAnalyst, runWellnessCoach } from "@/lib/agents";

const mockCreate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // @ts-expect-error accessing mock
  Anthropic.prototype.messages = { create: mockCreate };
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/lib/agents.test.ts 2>&1 | tail -15
```

Expected: FAIL

- [ ] **Step 3: Write agents implementation**

```typescript
// src/lib/agents.ts
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

// ---- Agent 1: Mood Analyzer ----------------------------------------

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

// ---- Agent 2: Trigger Analyst --------------------------------------

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

// ---- Agent 3: Wellness Coach ---------------------------------------

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
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/lib/agents.test.ts 2>&1 | tail -15
```

Expected: `7 tests passed`

- [ ] **Step 5: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/lib/agents.ts src/__tests__/lib/agents.test.ts
git commit -m "feat: add 3-agent Claude pipeline with tests"
```

---

## Task 7: Secure API Route

**Files:**
- Create: `src/app/api/analyze/route.ts`
- Create: `src/__tests__/api/analyze.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/__tests__/api/analyze.test.ts
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

  it("runs trigger analyst and wellness coach in parallel (Phase 2)", async () => {
    const req = makeRequest({
      examType: "NEET",
      moodScore: 2,
      triggers: ["Fear of failure"],
      reflection: "stressed",
    });
    await POST(req);
    // Both agent 2 and agent 3 must have been called
    expect(runTriggerAnalyst).toHaveBeenCalledOnce();
    expect(runWellnessCoach).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/api/analyze.test.ts 2>&1 | tail -15
```

Expected: FAIL

- [ ] **Step 3: Write the API route**

```typescript
// src/app/api/analyze/route.ts
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
  // Rate limit by IP
  const ip = getClientIp(req);
  if (!apiRateLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  // Validate input
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
    // Phase 1: Mood Analyzer (must complete first — its output feeds Phase 2)
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
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/api/analyze.test.ts 2>&1 | tail -15
```

Expected: `5 tests passed`

- [ ] **Step 5: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/app/api/analyze/route.ts src/__tests__/api/analyze.test.ts
git commit -m "feat: add secure /api/analyze route with rate limiting and Zod validation"
```

---

## Task 8: UI Components — Primitives

**Files:**
- Create: `src/components/MoodSelector.tsx`
- Create: `src/components/TriggerGrid.tsx`
- Create: `src/components/ProgressSteps.tsx`
- Create: `src/components/cards/SkeletonCard.tsx`
- Create: `src/__tests__/components/MoodSelector.test.tsx`

- [ ] **Step 1: Write MoodSelector test**

```typescript
// src/__tests__/components/MoodSelector.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MoodSelector } from "@/components/MoodSelector";

describe("MoodSelector", () => {
  it("renders 5 mood buttons", () => {
    render(<MoodSelector value={null} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole("radio");
    expect(buttons).toHaveLength(5);
  });

  it("marks selected button as checked", () => {
    render(<MoodSelector value={3} onChange={vi.fn()} />);
    const neutral = screen.getByLabelText(/neutral/i);
    expect(neutral).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange when a button is clicked", async () => {
    const onChange = vi.fn();
    render(<MoodSelector value={null} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText(/good/i));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/components/MoodSelector.test.tsx 2>&1 | tail -10
```

Expected: FAIL

- [ ] **Step 3: Write MoodSelector**

```tsx
// src/components/MoodSelector.tsx
"use client";

interface MoodOption {
  score: number;
  emoji: string;
  label: string;
  ariaLabel: string;
}

const MOODS: MoodOption[] = [
  { score: 1, emoji: "😰", label: "Very Stressed", ariaLabel: "Very stressed, score 1 of 5" },
  { score: 2, emoji: "😟", label: "Anxious", ariaLabel: "Anxious, score 2 of 5" },
  { score: 3, emoji: "😐", label: "Neutral", ariaLabel: "Neutral, score 3 of 5" },
  { score: 4, emoji: "🙂", label: "Okay", ariaLabel: "Okay, score 4 of 5" },
  { score: 5, emoji: "😊", label: "Good", ariaLabel: "Good, score 5 of 5" },
];

interface Props {
  value: number | null;
  onChange: (score: number) => void;
}

export function MoodSelector({ value, onChange }: Props) {
  function handleKeyDown(e: React.KeyboardEvent, score: number) {
    if (e.key === "ArrowRight") {
      const next = Math.min(score + 1, 5);
      onChange(next);
      (e.currentTarget.parentElement?.querySelector(`[data-score="${next}"]`) as HTMLElement)?.focus();
    } else if (e.key === "ArrowLeft") {
      const prev = Math.max(score - 1, 1);
      onChange(prev);
      (e.currentTarget.parentElement?.querySelector(`[data-score="${prev}"]`) as HTMLElement)?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(score);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Select your current mood"
      className="flex gap-2 sm:gap-3"
    >
      {MOODS.map((mood) => {
        const selected = value === mood.score;
        return (
          <button
            key={mood.score}
            role="radio"
            aria-checked={selected}
            aria-label={mood.ariaLabel}
            data-score={mood.score}
            tabIndex={selected || (value === null && mood.score === 1) ? 0 : -1}
            onClick={() => onChange(mood.score)}
            onKeyDown={(e) => handleKeyDown(e, mood.score)}
            className={[
              "flex-1 min-w-0 flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
              selected
                ? "border-brand-green bg-brand-green/10 shadow-[0_0_16px_rgba(16,185,129,0.2)]"
                : "border-white/10 bg-bg-input hover:border-brand-green/40 hover:bg-brand-green/5 hover:-translate-y-0.5",
            ].join(" ")}
          >
            <span className="text-2xl sm:text-3xl leading-none" aria-hidden="true">
              {mood.emoji}
            </span>
            <span
              className={`text-[0.65rem] sm:text-xs font-semibold ${
                selected ? "text-brand-green" : "text-white/40"
              }`}
            >
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Write TriggerGrid**

```tsx
// src/components/TriggerGrid.tsx
"use client";

interface Trigger {
  value: string;
  emoji: string;
  label: string;
}

const TRIGGERS: Trigger[] = [
  { value: "Heavy study load", emoji: "📚", label: "Heavy Study Load" },
  { value: "Performance anxiety", emoji: "😓", label: "Performance Anxiety" },
  { value: "Peer pressure", emoji: "👥", label: "Peer Pressure" },
  { value: "Family expectations", emoji: "👨‍👩‍👦", label: "Family Expectations" },
  { value: "Poor time management", emoji: "⏰", label: "Time Management" },
  { value: "Sleep issues", emoji: "😴", label: "Sleep Issues" },
  { value: "Social isolation", emoji: "🏠", label: "Social Isolation" },
  { value: "Fear of failure", emoji: "😨", label: "Fear of Failure" },
];

interface Props {
  selected: string[];
  onChange: (triggers: string[]) => void;
}

export function TriggerGrid({ selected, onChange }: Props) {
  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((t) => t !== value)
        : [...selected, value]
    );
  }

  return (
    <div
      role="group"
      aria-label="Select all stress triggers that apply"
      className="grid grid-cols-2 sm:grid-cols-4 gap-2"
    >
      {TRIGGERS.map((trigger) => {
        const checked = selected.includes(trigger.value);
        return (
          <label
            key={trigger.value}
            className={[
              "flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200",
              "hover:border-brand-indigo/50 hover:bg-brand-indigo/5",
              checked
                ? "border-brand-indigo bg-brand-indigo/10"
                : "border-white/8 bg-bg-input",
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(trigger.value)}
              aria-label={trigger.label}
              className="w-4 h-4 accent-brand-indigo flex-shrink-0"
            />
            <span
              className={`text-xs font-medium ${
                checked ? "text-white" : "text-white/60"
              }`}
            >
              {trigger.emoji} {trigger.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Write ProgressSteps**

```tsx
// src/components/ProgressSteps.tsx
import type { AnalysisPhase } from "@/types";

interface Props {
  phase: AnalysisPhase;
}

interface Step {
  id: AnalysisPhase;
  label: string;
  phases: AnalysisPhase[];
}

const STEPS: Step[] = [
  { id: "mood", label: "Mood Analysis", phases: ["mood"] },
  { id: "triggers", label: "Trigger Analysis", phases: ["triggers", "wellness"] },
  { id: "wellness", label: "Wellness Plan", phases: ["wellness"] },
];

export function ProgressSteps({ phase }: Props) {
  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      role="status"
      aria-label="Analysis progress"
      className="flex flex-wrap gap-2 justify-center mt-4"
    >
      {STEPS.map((step, idx) => {
        const isActive = step.phases.includes(phase);
        const phaseOrder: AnalysisPhase[] = ["mood", "triggers", "wellness", "done"];
        const currentIdx = phaseOrder.indexOf(phase);
        const stepIdx = phaseOrder.indexOf(step.id);
        const isDone = currentIdx > stepIdx;

        return (
          <span
            key={step.id}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              isDone
                ? "border-brand-green/30 text-brand-green bg-brand-green/10"
                : isActive
                ? "border-brand-green text-brand-green bg-brand-green/10 animate-pulse"
                : "border-white/10 text-white/30 bg-bg-input",
            ].join(" ")}
          >
            <span
              className={[
                "w-1.5 h-1.5 rounded-full",
                isDone ? "bg-brand-green" : isActive ? "bg-brand-green" : "bg-white/20",
              ].join(" ")}
              aria-hidden="true"
            />
            {idx + 1}. {step.label}
            {isDone && " ✓"}
          </span>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Write SkeletonCard**

```tsx
// src/components/cards/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className="space-y-3 animate-fade-in" aria-busy="true" aria-label="Loading analysis">
      <div className="h-3 bg-bg-card-hover rounded-full w-2/3 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-bg-card-hover via-white/5 to-bg-card-hover" />
      <div className="h-16 bg-bg-card-hover rounded-xl animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-bg-card-hover via-white/5 to-bg-card-hover" />
      <div className="h-3 bg-bg-card-hover rounded-full w-3/4 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-bg-card-hover via-white/5 to-bg-card-hover" />
      <div className="h-3 bg-bg-card-hover rounded-full w-1/2 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-bg-card-hover via-white/5 to-bg-card-hover" />
    </div>
  );
}
```

- [ ] **Step 7: Run tests**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run src/__tests__/components/MoodSelector.test.tsx 2>&1 | tail -10
```

Expected: `3 tests passed`

- [ ] **Step 8: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/components/
git commit -m "feat: add MoodSelector, TriggerGrid, ProgressSteps, SkeletonCard"
```

---

## Task 9: Output Cards

**Files:**
- Create: `src/components/cards/EmotionalHealthCard.tsx`
- Create: `src/components/cards/TriggerAnalysisCard.tsx`
- Create: `src/components/cards/WellnessPlanCard.tsx`

- [ ] **Step 1: Write EmotionalHealthCard**

```tsx
// src/components/cards/EmotionalHealthCard.tsx
"use client";

import { useEffect, useRef } from "react";
import type { HealthAnalysis } from "@/types";
import { SkeletonCard } from "./SkeletonCard";

const MOOD_EMOJIS: Record<number, string> = { 1: "😰", 2: "😟", 3: "😐", 4: "🙂", 5: "😊" };
const RISK_COLORS: Record<string, string> = {
  low: "text-brand-green bg-brand-green/15 border-brand-green/20",
  medium: "text-brand-amber bg-brand-amber/15 border-brand-amber/20",
  high: "text-brand-red bg-brand-red/15 border-brand-red/20",
};
const FILL_COLORS: Record<string, string> = {
  low: "from-brand-green to-emerald-400",
  medium: "from-brand-amber to-yellow-400",
  high: "from-brand-red to-rose-400",
};

interface Props {
  data: HealthAnalysis | null;
  moodScore: number | null;
  loading: boolean;
}

export function EmotionalHealthCard({ data, moodScore, loading }: Props) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fillRef.current && data) {
      setTimeout(() => {
        if (fillRef.current) fillRef.current.style.width = `${data.burnoutScore}%`;
      }, 150);
    }
  }, [data]);

  return (
    <article className="rounded-2xl bg-bg-card border border-white/8 border-t-2 border-t-brand-red p-6 shadow-lg animate-fade-in">
      <header className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-brand-red/10 flex items-center justify-center text-lg" aria-hidden="true">
          🧭
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Emotional Health</h2>
          <p className="text-xs text-white/40">Burnout risk &amp; insights</p>
        </div>
      </header>

      {loading && <SkeletonCard />}

      {!loading && !data && (
        <p className="text-sm text-white/40 text-center py-6">
          Complete a check-in to see your emotional health analysis.
        </p>
      )}

      {!loading && data && (
        <div className="space-y-4 animate-fade-in">
          {/* State + emoji */}
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden="true">
              {MOOD_EMOJIS[moodScore ?? 3]}
            </span>
            <div>
              <p className="font-bold text-white">{data.emotionalState}</p>
              {data.primaryEmotion && (
                <p className="text-xs text-white/40 mt-0.5">
                  Primarily feeling: {data.primaryEmotion}
                </p>
              )}
            </div>
          </div>

          {/* Burnout meter */}
          <div
            role="meter"
            aria-label={`Burnout risk: ${data.burnoutRisk}, score ${data.burnoutScore} out of 100`}
            aria-valuenow={data.burnoutScore}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/40 font-medium">Burnout Risk</span>
              <span
                className={`text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  RISK_COLORS[data.burnoutRisk] ?? RISK_COLORS.low
                }`}
              >
                {data.burnoutRisk.toUpperCase()}
              </span>
            </div>
            <div className="h-2 bg-bg-input rounded-full overflow-hidden">
              <div
                ref={fillRef}
                style={{ width: "0%" }}
                className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${
                  FILL_COLORS[data.burnoutRisk] ?? FILL_COLORS.low
                }`}
              />
            </div>
          </div>

          {/* Insights */}
          {data.insights.length > 0 && (
            <ul className="space-y-2" aria-label="Key insights about your emotional state">
              {data.insights.map((insight, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-white/60 leading-relaxed">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-red flex-shrink-0"
                    aria-hidden="true"
                  />
                  {insight}
                </li>
              ))}
            </ul>
          )}

          {/* Affirmation */}
          {data.affirmation && (
            <blockquote
              role="note"
              aria-label="Affirmation for you"
              className="border-l-2 border-brand-red/40 pl-3 italic text-sm text-white/50 leading-relaxed"
            >
              "{data.affirmation}"
            </blockquote>
          )}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 2: Write TriggerAnalysisCard**

```tsx
// src/components/cards/TriggerAnalysisCard.tsx
"use client";

import { useEffect, useRef } from "react";
import type { TriggerAnalysis, RankedTrigger } from "@/types";
import { SkeletonCard } from "./SkeletonCard";

const SEV_TEXT: Record<string, string> = {
  low: "text-brand-green",
  medium: "text-brand-amber",
  high: "text-brand-red",
};
const SEV_FILL: Record<string, string> = {
  low: "bg-brand-green",
  medium: "bg-brand-amber",
  high: "bg-brand-red",
};

function TriggerBar({ item }: { item: RankedTrigger }) {
  const fillRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = `${item.severityScore}%`;
    }, 200);
  }, [item.severityScore]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-white">{item.trigger}</span>
        <span
          className={`text-[0.65rem] font-bold uppercase tracking-wider ${SEV_TEXT[item.severity] ?? SEV_TEXT.medium}`}
        >
          {item.severity}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={item.severityScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${item.trigger}: ${item.severity} severity`}
        className="h-1.5 bg-bg-input rounded-full overflow-hidden"
      >
        <div
          ref={fillRef}
          style={{ width: "0%" }}
          className={`h-full rounded-full transition-all duration-600 ease-out ${SEV_FILL[item.severity] ?? SEV_FILL.medium}`}
        />
      </div>
      {item.rootCause && (
        <p className="text-xs text-white/35 leading-relaxed">{item.rootCause}</p>
      )}
    </div>
  );
}

interface Props {
  data: TriggerAnalysis | null;
  loading: boolean;
}

export function TriggerAnalysisCard({ data, loading }: Props) {
  return (
    <article className="rounded-2xl bg-bg-card border border-white/8 border-t-2 border-t-brand-amber p-6 shadow-lg animate-fade-in">
      <header className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-brand-amber/10 flex items-center justify-center text-lg" aria-hidden="true">
          ⚡
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Trigger Analysis</h2>
          <p className="text-xs text-white/40">Severity &amp; root causes</p>
        </div>
      </header>

      {loading && <SkeletonCard />}

      {!loading && !data && (
        <p className="text-sm text-white/40 text-center py-6">
          Select stress triggers above to see your detailed analysis.
        </p>
      )}

      {!loading && data && (
        <div className="space-y-4 animate-fade-in">
          {data.primaryTrigger && (
            <div className="rounded-xl bg-brand-amber/8 border border-brand-amber/20 p-3">
              <p className="text-[0.65rem] font-bold text-brand-amber uppercase tracking-wider mb-0.5">
                Primary Stressor
              </p>
              <p className="text-sm font-semibold text-white">{data.primaryTrigger}</p>
            </div>
          )}

          {data.rankedTriggers.length === 0 ? (
            <p className="text-sm text-white/50 leading-relaxed">{data.overallMessage}</p>
          ) : (
            <div className="space-y-3">
              {data.rankedTriggers.map((item) => (
                <TriggerBar key={item.trigger} item={item} />
              ))}
            </div>
          )}

          {data.overallMessage && data.rankedTriggers.length > 0 && (
            <p className="text-xs text-white/35 italic border-t border-white/8 pt-3 leading-relaxed">
              {data.overallMessage}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 3: Write WellnessPlanCard**

```tsx
// src/components/cards/WellnessPlanCard.tsx
import type { WellnessPlan } from "@/types";
import { SkeletonCard } from "./SkeletonCard";

interface SectionProps {
  title: string;
  items: string[];
  extra?: string;
}

function WellnessSection({ title, items, extra }: SectionProps) {
  return (
    <div className="rounded-xl bg-bg-input p-3.5">
      <p className="text-[0.65rem] font-bold text-brand-green uppercase tracking-wider mb-2">
        {title}
      </p>
      <ul className="space-y-1.5" aria-label={title}>
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/60 leading-relaxed">
            <span className="text-brand-green mt-0.5 flex-shrink-0" aria-hidden="true">→</span>
            {item}
          </li>
        ))}
      </ul>
      {extra && <p className="text-xs text-brand-green/70 font-semibold mt-2">{extra}</p>}
    </div>
  );
}

interface Props {
  data: WellnessPlan | null;
  loading: boolean;
}

export function WellnessPlanCard({ data, loading }: Props) {
  return (
    <article className="rounded-2xl bg-bg-card border border-white/8 border-t-2 border-t-brand-green p-6 shadow-lg animate-fade-in">
      <header className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-brand-green/10 flex items-center justify-center text-lg" aria-hidden="true">
          🌱
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Your Wellness Plan</h2>
          <p className="text-xs text-white/40">Personalized action steps</p>
        </div>
      </header>

      {loading && <SkeletonCard />}

      {!loading && !data && (
        <p className="text-sm text-white/40 text-center py-6">
          Your personalized wellness plan will appear here after the analysis.
        </p>
      )}

      {!loading && data && (
        <div className="space-y-3 animate-fade-in">
          <WellnessSection
            title={`⚡ ${data.immediateAction.title}`}
            items={data.immediateAction.steps}
            extra={`Duration: ${data.immediateAction.duration}`}
          />
          <WellnessSection
            title={`📖 ${data.studyStrategy.title}`}
            items={data.studyStrategy.tips}
          />
          <WellnessSection
            title={`🌿 ${data.selfCare.title}`}
            items={data.selfCare.activities}
          />

          <blockquote
            role="note"
            aria-label="Motivational message for you"
            className="rounded-xl border border-brand-green/20 bg-gradient-to-br from-brand-green/8 to-brand-indigo/8 p-4 text-center"
          >
            <p className="text-sm italic text-white/80 leading-relaxed">
              "{data.motivationalMessage}"
            </p>
            {data.weeklyGoal && (
              <p className="text-xs text-brand-green font-semibold mt-3">
                🎯 This week: {data.weeklyGoal}
              </p>
            )}
          </blockquote>
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/components/cards/
git commit -m "feat: add EmotionalHealthCard, TriggerAnalysisCard, WellnessPlanCard"
```

---

## Task 10: MoodHistory + CrisisResources

**Files:**
- Create: `src/components/MoodHistory.tsx`
- Create: `src/components/CrisisResources.tsx`

- [ ] **Step 1: Write MoodHistory**

```tsx
// src/components/MoodHistory.tsx
"use client";

import { useEffect, useState } from "react";
import type { MoodHistoryEntry } from "@/types";
import { loadHistory } from "@/lib/storage";

const BAR_COLOR: Record<number, string> = {
  1: "bg-brand-red",
  2: "bg-orange-500",
  3: "bg-brand-amber",
  4: "bg-lime-500",
  5: "bg-brand-green",
};

export function MoodHistory() {
  const [history, setHistory] = useState<MoodHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory().slice(-7));
  }, []);

  return (
    <section
      aria-labelledby="historyTitle"
      className="rounded-2xl bg-bg-card border border-white/8 p-6 shadow-lg"
    >
      <div className="flex justify-between items-center mb-5">
        <h2 id="historyTitle" className="text-sm font-bold text-white">
          📈 Mood History
        </h2>
        <span className="text-xs text-white/30">Last 7 check-ins</span>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-8">
          Complete your first check-in to see your mood trend here.
        </p>
      ) : (
        <figure
          role="img"
          aria-label={`Mood history bar chart. ${history.length} check-ins shown.`}
          className="flex items-end gap-3 h-24"
        >
          {history.map((entry, i) => {
            const heightPct = (entry.score / 5) * 78 + 12;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${BAR_COLOR[entry.score] ?? "bg-white/20"}`}
                  style={{ height: `${heightPct}px` }}
                  title={`${entry.exam} — Score ${entry.score}/5 on ${entry.date}`}
                  role="img"
                  aria-label={`Score ${entry.score} on ${entry.date}`}
                />
                <span className="text-[0.55rem] text-white/25">{entry.date.slice(5)}</span>
              </div>
            );
          })}
        </figure>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Write CrisisResources**

```tsx
// src/components/CrisisResources.tsx
interface Contact {
  name: string;
  number: string;
  tel: string;
  hours: string;
}

const CONTACTS: Contact[] = [
  { name: "iCall (TISS)", number: "9152987821", tel: "9152987821", hours: "Mon–Sat, 8am–10pm" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", tel: "18602662345", hours: "24/7 Free" },
  { name: "NIMHANS Helpline", number: "080-46110007", tel: "08046110007", hours: "National support" },
  { name: "Snehi India", number: "044-24640050", tel: "04424640050", hours: "Mon–Sat, 8am–10pm" },
];

export function CrisisResources() {
  return (
    <section
      aria-labelledby="crisisTitle"
      className="rounded-2xl border border-brand-red/15 bg-brand-red/4 p-6 shadow-lg"
    >
      <header className="flex items-center gap-2.5 mb-3">
        <span aria-hidden="true" className="text-lg">🆘</span>
        <h2 id="crisisTitle" className="text-sm font-bold text-brand-red">
          Need Immediate Support?
        </h2>
      </header>

      <p className="text-sm text-white/40 mb-5 leading-relaxed">
        If you're feeling overwhelmed, having thoughts of self-harm, or in a mental health crisis —
        please reach out immediately. Help is available right now and you are not alone.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CONTACTS.map((contact) => (
          <div
            key={contact.name}
            className="rounded-xl bg-bg-card border border-white/8 p-3.5"
          >
            <p className="text-xs font-semibold text-white/80 mb-1">{contact.name}</p>
            <a
              href={`tel:${contact.tel}`}
              className="text-sm font-bold text-brand-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              aria-label={`Call ${contact.name} at ${contact.number}`}
            >
              {contact.number}
            </a>
            <p className="text-[0.65rem] text-white/25 mt-0.5">{contact.hours}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/components/MoodHistory.tsx src/components/CrisisResources.tsx
git commit -m "feat: add MoodHistory chart and CrisisResources"
```

---

## Task 11: Global CSS + Layout

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace globals.css**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-inter: "Inter", system-ui, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}

body {
  background-color: #07111f;
  color: #f1f5f9;
  min-height: 100dvh;
  font-family: var(--font-inter);
}

/* Animated mesh background */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 15% 0%, rgba(16, 185, 129, 0.07) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 100%, rgba(99, 102, 241, 0.07) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(6, 17, 31, 0.9) 0%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}

/* Shimmer animation for skeletons */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus styles */
:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #07111f; }
::-webkit-scrollbar-thumb { background: #162540; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #1e3255; }
```

- [ ] **Step 2: Replace layout.tsx**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "MindSpace — Student Wellness Tracker",
  description:
    "AI-powered mental wellness tracker for students preparing for NEET, JEE, CUET, CAT, GATE, UPSC, and board exams.",
  keywords: ["mental wellness", "student", "NEET", "JEE", "stress tracker", "AI"],
  openGraph: {
    title: "MindSpace — Student Wellness Tracker",
    description: "Track your mood, identify stress triggers, and get personalized wellness support.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div id="skip-nav">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-green focus:text-black focus:rounded-lg focus:font-semibold"
          >
            Skip to main content
          </a>
        </div>
        {children}
        <div id="aria-live" aria-live="polite" aria-atomic="true" className="sr-only" />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: add global styles, layout with skip-nav and Open Graph meta"
```

---

## Task 12: Main Page

**Files:**
- Modify: `src/app/page.tsx`

This is the primary client component that orchestrates the entire UI.

- [ ] **Step 1: Write page.tsx**

```tsx
// src/app/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import type { AnalyzeRequest, AnalyzeResponse, AnalysisPhase, MoodHistoryEntry } from "@/types";
import { MoodSelector } from "@/components/MoodSelector";
import { TriggerGrid } from "@/components/TriggerGrid";
import { ProgressSteps } from "@/components/ProgressSteps";
import { EmotionalHealthCard } from "@/components/cards/EmotionalHealthCard";
import { TriggerAnalysisCard } from "@/components/cards/TriggerAnalysisCard";
import { WellnessPlanCard } from "@/components/cards/WellnessPlanCard";
import { MoodHistory } from "@/components/MoodHistory";
import { CrisisResources } from "@/components/CrisisResources";
import { saveEntry } from "@/lib/storage";
import { generateReport } from "@/lib/export";

const EXAM_OPTIONS = [
  "NEET",
  "JEE (Main / Advanced)",
  "CUET",
  "CAT",
  "GATE",
  "UPSC (Civil Services)",
  "Board Exams (10th / 12th)",
  "Other Competitive Exam",
];

function announce(message: string) {
  const el = document.getElementById("aria-live");
  if (!el) return;
  el.textContent = "";
  setTimeout(() => { el.textContent = message; }, 50);
}

export default function HomePage() {
  const [examType, setExamType] = useState("");
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }));
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!examType) { announce("Please select your exam type."); alert("Please select your exam type."); return; }
    if (!moodScore) { announce("Please select your current mood."); alert("Please select your current mood."); return; }

    setPhase("mood");
    setResult(null);
    setError(null);
    announce("Starting wellness analysis. This may take a few moments.");

    const body: AnalyzeRequest = {
      examType,
      moodScore,
      triggers,
      reflection: reflection.trim().slice(0, 500),
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        throw new Error("Too many requests. Please wait a minute and try again.");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      setPhase("triggers");
      const data = await res.json() as AnalyzeResponse;
      setPhase("wellness");

      await new Promise((r) => setTimeout(r, 400));
      setResult(data);
      setPhase("done");

      const entry: MoodHistoryEntry = {
        date: new Date().toISOString().slice(0, 10),
        score: moodScore,
        exam: examType,
        burnoutRisk: data.health.burnoutRisk,
        timestamp: Date.now(),
      };
      saveEntry(entry);

      announce("Analysis complete. Your personalized wellness report is ready.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed. Please try again.";
      setError(msg);
      setPhase("error");
      announce(`Analysis failed: ${msg}`);
    }
  }, [examType, moodScore, triggers, reflection]);

  function handleExport() {
    if (!result || !moodScore) return;
    const req: AnalyzeRequest = { examType, moodScore, triggers, reflection };
    const text = generateReport(req, result);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindspace_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    announce("Wellness report downloaded.");
  }

  function handleReset() {
    setExamType("");
    setMoodScore(null);
    setTriggers([]);
    setReflection("");
    setPhase("idle");
    setResult(null);
    setError(null);
    announce("Form reset. Ready for a new check-in.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const loading = phase === "mood" || phase === "triggers" || phase === "wellness";

  return (
    <div className="relative z-10 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ===== HEADER ===== */}
        <header className="flex items-center justify-between mb-10 pb-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl bg-brand-green/10 border border-brand-green/30 flex items-center justify-center text-xl animate-float"
              aria-hidden="true"
            >
              🧠
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-brand-green to-emerald-400 bg-clip-text text-transparent">
                MindSpace
              </h1>
              <p className="text-xs text-white/30 font-medium">Student Wellness Tracker · PromptWars 2025</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-green/20 bg-brand-green/5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" aria-hidden="true" />
            <span className="text-xs text-brand-green/80 font-medium">Powered by Claude</span>
          </div>
        </header>

        <main id="main-content">
          {/* ===== INPUT PANEL ===== */}
          <section
            aria-labelledby="inputTitle"
            className="rounded-2xl bg-bg-card border border-white/8 p-6 sm:p-8 mb-6 shadow-xl animate-slide-up"
          >
            <h2 id="inputTitle" className="text-base font-bold mb-6 flex items-center gap-3 after:flex-1 after:h-px after:bg-white/8">
              How are you feeling today?
            </h2>

            {/* Exam + Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="examType" className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  Preparing for
                </label>
                <select
                  id="examType"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  required
                  aria-required="true"
                  className="bg-bg-input border border-white/8 rounded-xl text-white/90 text-sm px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green/40 cursor-pointer transition-all"
                >
                  <option value="">Select your exam...</option>
                  {EXAM_OPTIONS.map((e) => (
                    <option key={e} value={e} className="bg-bg-card">{e}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Check-in Date</span>
                <div className="bg-bg-input border border-white/8 rounded-xl text-white/40 text-sm px-3.5 py-3">
                  {today}
                </div>
              </div>
            </div>

            {/* Mood */}
            <div className="mb-5">
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Current Mood</p>
              <MoodSelector value={moodScore} onChange={setMoodScore} />
            </div>

            {/* Triggers */}
            <div className="mb-5">
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
                What&rsquo;s weighing on you?{" "}
                <span className="normal-case text-white/25 font-normal">(select all that apply)</span>
              </p>
              <TriggerGrid selected={triggers} onChange={setTriggers} />
            </div>

            {/* Reflection */}
            <div className="mb-6">
              <label htmlFor="reflection" className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">
                What&rsquo;s on your mind?{" "}
                <span className="normal-case text-white/25 font-normal">(optional)</span>
              </label>
              <textarea
                id="reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Describe what's been difficult, how you've been feeling, or anything you want to get off your chest..."
                maxLength={500}
                rows={3}
                aria-describedby="reflectionCount"
                className="w-full bg-bg-input border border-white/8 rounded-xl text-white/80 text-sm px-4 py-3 placeholder-white/20 resize-y min-h-[88px] max-h-48 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green/40 transition-all"
              />
              <p id="reflectionCount" className="text-xs text-white/25 text-right mt-1" aria-live="polite">
                {reflection.length}/500
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              aria-label="Analyze my wellness"
              className="w-full py-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-brand-green to-emerald-400 hover:from-emerald-400 hover:to-brand-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-green/20 hover:shadow-brand-green/40 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
            >
              {loading ? "Analyzing... ✦" : "Analyze My Wellness ✦"}
            </button>

            <ProgressSteps phase={phase} />

            {error && (
              <div role="alert" className="mt-4 flex gap-2.5 rounded-xl bg-brand-red/10 border border-brand-red/30 p-4 text-sm text-rose-400">
                <span aria-hidden="true">⚠️</span>
                {error}
              </div>
            )}
          </section>

          {/* ===== OUTPUT CARDS ===== */}
          <section aria-label="Wellness analysis results" className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <EmotionalHealthCard data={result?.health ?? null} moodScore={moodScore} loading={loading} />
            <TriggerAnalysisCard data={result?.triggers ?? null} loading={loading} />
            <WellnessPlanCard data={result?.wellness ?? null} loading={loading} />
          </section>

          {/* ===== ACTION BUTTONS ===== */}
          {phase === "done" && result && (
            <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
              <button
                onClick={handleExport}
                aria-label="Download wellness report as text file"
                className="flex-1 min-w-[140px] py-3 px-5 rounded-xl border border-white/10 bg-bg-card text-white/60 text-sm font-semibold hover:border-brand-green/40 hover:text-white transition-all"
              >
                📄 Export Report
              </button>
              <button
                onClick={handleReset}
                aria-label="Start a new check-in"
                className="flex-1 min-w-[140px] py-3 px-5 rounded-xl border border-white/10 bg-bg-card text-white/60 text-sm font-semibold hover:border-brand-green/40 hover:text-white transition-all"
              >
                🔄 New Check-in
              </button>
            </div>
          )}

          {/* ===== HISTORY ===== */}
          <div className="mb-6">
            <MoodHistory />
          </div>

          {/* ===== CRISIS ===== */}
          <CrisisResources />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Delete the default Next.js page assets that conflict**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
rm -f src/app/favicon.ico public/next.svg public/vercel.svg 2>/dev/null || true
```

- [ ] **Step 3: Verify the app builds cleanly**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` and `Route (app) ... /api/analyze` listed.

- [ ] **Step 4: Smoke-test with dev server**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npm run dev &
sleep 5
curl -s http://localhost:3000 | grep -c "MindSpace"
kill %1
```

Expected: At least `1` (title found in HTML).

- [ ] **Step 5: Run all tests**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
npx vitest run 2>&1 | tail -15
```

Expected: All tests pass (≥20 tests).

- [ ] **Step 6: Commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add src/app/page.tsx src/app/globals.css src/app/layout.tsx
git commit -m "feat: add main page orchestrator with full analysis flow"
```

---

## Task 13: Deployment Setup

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "regions": ["bom1"]
}
```

- [ ] **Step 2: Create README.md**

```markdown
# MindSpace — Student Wellness Tracker

AI-powered mental wellness tracker for students preparing for NEET, JEE, CUET, CAT, GATE, and UPSC.

## Stack
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js), Zod validation, in-memory rate limiting
- **AI**: Anthropic Claude (`claude-opus-4-8`) — 3-agent pipeline

## Local Setup

```bash
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm install
npm run dev
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import in [vercel.com/new](https://vercel.com/new)
3. Set env var: `ANTHROPIC_API_KEY = sk-ant-...`
4. Click Deploy

## Run Tests

```bash
npm test
```
```

- [ ] **Step 3: Final commit**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git add vercel.json README.md
git commit -m "chore: add Vercel config and README"
```

- [ ] **Step 4: Push branch**

```bash
cd /Users/antrikshbahri/Desktop/google-prompt-war
git push -u origin nextjs-app 2>&1 | tail -5
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Secure backend — `/api/analyze` route, API key in env var only, rate limiter, Zod validation
- ✅ 3-agent Claude pipeline — Phase 1 (mood), Phase 2 parallel (triggers + wellness)
- ✅ Premium UI — glassmorphism cards, glow effects, gradient text, animations
- ✅ Mood history — localStorage, bar chart
- ✅ Export — plain-text report download
- ✅ Accessibility — ARIA roles/labels, radiogroup keyboard nav, skip-nav, aria-live, focus-visible, reduced-motion
- ✅ Tests — ratelimit, storage, export, agents (mocked), API route, MoodSelector component
- ✅ Code Quality — TypeScript strict, zod, module boundaries
- ✅ Vercel deployment — env var, vercel.json, README

**Placeholder scan:** None found.

**Type consistency:** All types defined in `src/types/index.ts` — `AnalyzeRequest`, `AnalyzeResponse`, `HealthAnalysis`, `TriggerAnalysis`, `WellnessPlan`, `MoodHistoryEntry`, `AnalysisPhase` — used consistently across all tasks.
