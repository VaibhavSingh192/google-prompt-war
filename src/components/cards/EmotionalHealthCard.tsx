"use client";

import { useEffect, useRef } from "react";
import type { HealthAnalysis } from "@/types";
import { SkeletonCard } from "./SkeletonCard";

const MOOD_EMOJIS: Record<number, string> = { 1: "😰", 2: "😟", 3: "😐", 4: "🙂", 5: "😊" };

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
      }, 200);
    }
  }, [data]);

  const riskMeta = {
    low:    { label: "LOW",    fill: "meter-fill-green", pill: "pill-green" },
    medium: { label: "MEDIUM", fill: "meter-fill-amber",  pill: "pill-amber" },
    high:   { label: "HIGH",   fill: "meter-fill-rose",   pill: "pill-rose" },
  };

  return (
    <article
      className="glass glow-rose animate-fade-in"
      style={{
        borderRadius: "20px",
        padding: "24px",
        borderTop: "2px solid rgba(251,113,133,0.4)",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div
          aria-hidden="true"
          style={{
            width: "36px", height: "36px",
            borderRadius: "10px",
            background: "rgba(251,113,133,0.1)",
            border: "1px solid rgba(251,113,133,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
          }}
        >🧭</div>
        <div>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0" }}>Emotional Health</h2>
          <p style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.45)", marginTop: "1px" }}>
            Burnout risk &amp; insights
          </p>
        </div>
      </header>

      {loading && <SkeletonCard />}

      {!loading && !data && (
        <p style={{ fontSize: "0.82rem", color: "rgba(148,163,184,0.4)", textAlign: "center", padding: "24px 0" }}>
          Complete a check-in to see your emotional health analysis.
        </p>
      )}

      {!loading && data && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* State */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span aria-hidden="true" style={{ fontSize: "2.5rem", lineHeight: 1 }}>
              {MOOD_EMOJIS[moodScore ?? 3]}
            </span>
            <div>
              <p style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.95rem" }}>{data.emotionalState}</p>
              {data.primaryEmotion && (
                <p style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.45)", marginTop: "2px" }}>
                  Primarily: {data.primaryEmotion}
                </p>
              )}
            </div>
          </div>

          {/* Burnout meter */}
          <div
            role="meter"
            aria-label={`Burnout risk: ${data.burnoutRisk}, ${data.burnoutScore} out of 100`}
            aria-valuenow={data.burnoutScore}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.5)", fontWeight: 500 }}>
                Burnout Risk
              </span>
              <span className={`pill ${riskMeta[data.burnoutRisk]?.pill ?? "pill-green"}`}>
                {riskMeta[data.burnoutRisk]?.label ?? "LOW"}
              </span>
            </div>
            <div className="meter-track">
              <div
                ref={fillRef}
                style={{ width: "0%" }}
                className={`meter-fill ${riskMeta[data.burnoutRisk]?.fill ?? "meter-fill-green"}`}
              />
            </div>
          </div>

          {/* Insights */}
          {data.insights.length > 0 && (
            <ul style={{ listStyle: "none" }} aria-label="Key insights">
              {data.insights.map((insight, i) => (
                <li key={i} className="insight-item">
                  <span className="insight-dot" style={{ background: "#fb7185" }} aria-hidden="true" />
                  {insight}
                </li>
              ))}
            </ul>
          )}

          {/* Affirmation */}
          {data.affirmation && (
            <blockquote
              role="note"
              style={{
                borderLeft: "2px solid rgba(251,113,133,0.3)",
                paddingLeft: "12px",
                fontStyle: "italic",
                fontSize: "0.82rem",
                color: "rgba(148,163,184,0.6)",
                lineHeight: 1.6,
              }}
            >
              &ldquo;{data.affirmation}&rdquo;
            </blockquote>
          )}
        </div>
      )}
    </article>
  );
}
