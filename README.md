# MindSpace — Student Wellness Tracker

> AI-powered mental wellness companion for students preparing for NEET, JEE, CUET, CAT, GATE, UPSC, and board exams.

## What it does

- **Mood Tracking** — 5-level mood scale with emoji indicators
- **Stress Trigger Analysis** — Identifies and ranks 8 common exam stressors
- **3-Agent AI Pipeline** — Claude `claude-opus-4-8` runs parallel wellness agents
- **Wellness Plan** — Immediate action, study strategy, and self-care recommendations
- **Mood History** — 7-entry bar chart stored locally in your browser
- **Crisis Resources** — Always-visible Indian mental health helplines

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Next.js API Routes (Node.js), Zod, in-memory rate limiting |
| AI | `@anthropic-ai/sdk`, `claude-opus-4-8`, 3-agent pipeline |
| Tests | Vitest 4, @testing-library/react |

## Architecture

```
Browser → POST /api/analyze → Phase 1: Mood Analyzer
                             → Phase 2: [Trigger Analyst ∥ Wellness Coach]
                             ← AnalyzeResponse { health, triggers, wellness }
```

API key stays server-side — never reaches the browser.

## Local Development

```bash
# 1. Clone and install
npm install

# 2. Set API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# 3. Run dev server
npm run dev

# 4. Open http://localhost:3000
```

## Run Tests

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

## Deploy to Vercel

1. Push this branch to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → import repo
3. Set environment variable: `ANTHROPIC_API_KEY = sk-ant-...`
4. Click **Deploy** — done in ~60 seconds

## Evaluation Criteria Coverage

| Criterion | Implementation |
|---|---|
| Code Quality | TypeScript strict, Zod validation, modular architecture |
| Security | API key server-only, rate limiting, CSP headers, input sanitization |
| Efficiency | Phase 2 agents run in parallel (`Promise.all`), localStorage (no DB needed) |
| Testing | 26 Vitest tests: rate limiter, storage, export, agents (mocked), API route, components |
| Accessibility | ARIA roles, radiogroup keyboard nav, skip-nav, aria-live, focus-visible, reduced-motion |
| Problem Alignment | Mood tracking, stress triggers, emotion reflection, personalized wellness |
