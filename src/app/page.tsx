"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [examType, setExamType] = useState("");
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    );
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!examType) { announce("Please select your exam type."); alert("Please select your exam type."); return; }
    if (!moodScore) { announce("Please select your current mood."); alert("Please select your current mood."); return; }

    setPhase("mood");
    setResult(null);
    setError(null);
    announce("Starting wellness analysis.");

    const body: AnalyzeRequest = {
      examType, moodScore, triggers,
      reflection: reflection.trim().slice(0, 500),
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 429) throw new Error("Too many requests. Please wait a minute and try again.");
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      setPhase("triggers");
      const data = (await res.json()) as AnalyzeResponse;
      setPhase("wellness");
      await new Promise((r) => setTimeout(r, 300));
      setResult(data);
      setPhase("done");

      saveEntry({
        date: new Date().toISOString().slice(0, 10),
        score: moodScore,
        exam: examType,
        burnoutRisk: data.health.burnoutRisk,
        timestamp: Date.now(),
      } as MoodHistoryEntry);

      announce("Analysis complete. Your wellness report is ready.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed. Please try again.";
      setError(msg);
      setPhase("error");
      announce(`Analysis failed: ${msg}`);
    }
  }, [examType, moodScore, triggers, reflection]);

  function handleExport() {
    if (!result || !moodScore) return;
    const text = generateReport({ examType, moodScore, triggers, reflection }, result);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindspace_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    announce("Report downloaded.");
  }

  function handleLogout() {
    document.cookie = "ms_auth=; path=/; max-age=0";
    router.push("/login");
  }

  function handleReset() {
    setExamType(""); setMoodScore(null); setTriggers([]);
    setReflection(""); setPhase("idle"); setResult(null); setError(null);
    announce("Reset. Ready for a new check-in.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const loading = phase === "mood" || phase === "triggers" || phase === "wellness";

  return (
    <div className="relative z-10 min-h-screen">
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 24px 32px" }}>

        {/* ── HEADER ─────────────────────────────── */}
        <header className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-float"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))",
                border: "1px solid rgba(16,185,129,0.25)",
                boxShadow: "0 0 24px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
              aria-hidden="true"
            >
              🧠
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gradient-green tracking-tight">
                MindSpace
              </h1>
              <p className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.45)" }}>
                Student Wellness Tracker · PromptWars 2025
              </p>
            </div>
          </div>

          {/* Header right: date + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(148,163,184,0.45)",
              }}
            >
              <span style={{ color: "#10b981", opacity: 0.7 }}>◉</span>
              {today}
            </div>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,0.5)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-outfit)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(251,113,133,0.35)";
                (e.currentTarget as HTMLElement).style.color = "#fb7185";
                (e.currentTarget as HTMLElement).style.background = "rgba(251,113,133,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.color = "rgba(148,163,184,0.5)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
              }}
            >
              <span aria-hidden="true" style={{ fontSize: "0.8rem" }}>⎋</span>
              Sign out
            </button>
          </div>
        </header>

        <main id="main-content">

          {/* ── INPUT CARD ──────────────────────── */}
          <section
            aria-labelledby="inputTitle"
            className="glass rounded-2xl p-5 mb-4 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-5">
              <h2 id="inputTitle" className="text-lg font-bold" style={{ color: "#e2e8f0" }}>
                How are you feeling today?
              </h2>
              <span
                className="pill pill-green"
                style={{ fontSize: "0.65rem" }}
              >
                Daily check-in
              </span>
            </div>

            {/* Row 1: Exam + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label htmlFor="examType" className="field-label">Preparing for</label>
                <select
                  id="examType"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  required
                  aria-required="true"
                  className="input-field"
                >
                  <option value="">Select your exam...</option>
                  {EXAM_OPTIONS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="field-label">Check-in Date</span>
                <div
                  className="input-field"
                  style={{
                    color: "rgba(148,163,184,0.5)",
                    cursor: "default",
                    fontSize: "0.88rem",
                  }}
                >
                  {today || "Loading..."}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "16px" }} />

            {/* Row 2: Mood */}
            <div className="mb-4">
              <p className="field-label">Current Mood</p>
              <MoodSelector value={moodScore} onChange={setMoodScore} />
            </div>

            {/* Row 3: Triggers */}
            <div className="mb-4">
              <p className="field-label">
                What&rsquo;s weighing on you?{" "}
                <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: "normal", color: "rgba(100,116,139,0.6)" }}>
                  select all that apply
                </span>
              </p>
              <TriggerGrid selected={triggers} onChange={setTriggers} />
            </div>

            {/* Row 4: Reflection */}
            <div className="mb-4">
              <label htmlFor="reflection" className="field-label">
                What&rsquo;s on your mind?{" "}
                <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: "normal", color: "rgba(100,116,139,0.6)" }}>
                  optional
                </span>
              </label>
              <textarea
                id="reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Describe what's been difficult, how you've been feeling, or anything on your mind..."
                maxLength={500}
                rows={3}
                aria-describedby="reflectionCount"
                className="input-field"
              />
              <p
                id="reflectionCount"
                className="text-right mt-1.5"
                style={{ fontSize: "0.72rem", color: "rgba(100,116,139,0.5)" }}
                aria-live="polite"
              >
                {reflection.length}/500
              </p>
            </div>

            {/* Analyze */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              aria-label="Analyze my wellness"
              className="btn-analyze"
            >
              {loading ? "Analyzing your wellness... ✦" : "Analyze My Wellness ✦"}
            </button>

            <ProgressSteps phase={phase} />

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl p-4 mt-4 text-sm"
                style={{
                  background: "rgba(251,113,133,0.08)",
                  border: "1px solid rgba(251,113,133,0.2)",
                  color: "#fb7185",
                }}
              >
                <span aria-hidden="true" className="text-base flex-shrink-0">⚠️</span>
                {error}
              </div>
            )}
          </section>

          {/* ── OUTPUT CARDS ─────────────────────── */}
          <section
            aria-label="Wellness analysis results"
            className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4"
            style={{ animationDelay: "0.2s" }}
          >
            <EmotionalHealthCard data={result?.health ?? null} moodScore={moodScore} loading={loading} />
            <TriggerAnalysisCard data={result?.triggers ?? null} loading={loading} />
            <WellnessPlanCard data={result?.wellness ?? null} loading={loading} />
          </section>

          {/* ── ACTION BUTTONS ───────────────────── */}
          {phase === "done" && result && (
            <div className="flex flex-wrap gap-3 mb-4 animate-fade-in">
              <button onClick={handleExport} aria-label="Download wellness report" className="btn-action">
                📄 Export Report
              </button>
              <button onClick={handleReset} aria-label="Start a new check-in" className="btn-action">
                🔄 New Check-in
              </button>
            </div>
          )}

          {/* ── MOOD HISTORY ─────────────────────── */}
          <div className="mb-4">
            <MoodHistory />
          </div>

          {/* ── CRISIS ───────────────────────────── */}
          <CrisisResources />
        </main>
      </div>
    </div>
  );
}
