"use client";

import { useEffect, useRef } from "react";
import type { TriggerAnalysis, RankedTrigger } from "@/types";
import { SkeletonCard } from "./SkeletonCard";

const SEV_COLOR: Record<string, string> = {
  low:    "#10b981",
  medium: "#fbbf24",
  high:   "#fb7185",
};
const SEV_FILL: Record<string, string> = {
  low:    "meter-fill-green",
  medium: "meter-fill-amber",
  high:   "meter-fill-rose",
};

function TriggerBar({ item }: { item: RankedTrigger }) {
  const fillRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = `${item.severityScore}%`;
    }, 250);
  }, [item.severityScore]);

  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
        <span style={{ fontSize: "0.83rem", fontWeight: 600, color: "#e2e8f0" }}>{item.trigger}</span>
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: SEV_COLOR[item.severity] ?? "#fbbf24",
          }}
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
        className="meter-track"
      >
        <div
          ref={fillRef}
          style={{ width: "0%" }}
          className={`meter-fill ${SEV_FILL[item.severity] ?? SEV_FILL.medium}`}
        />
      </div>
      {item.rootCause && (
        <p style={{ fontSize: "0.74rem", color: "rgba(148,163,184,0.45)", marginTop: "4px", lineHeight: 1.4 }}>
          {item.rootCause}
        </p>
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
    <article
      className="glass glow-amber animate-fade-in"
      style={{
        borderRadius: "20px",
        padding: "24px",
        borderTop: "2px solid rgba(251,191,36,0.4)",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div
          aria-hidden="true"
          style={{
            width: "36px", height: "36px",
            borderRadius: "10px",
            background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
          }}
        >⚡</div>
        <div>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0" }}>Trigger Analysis</h2>
          <p style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.45)", marginTop: "1px" }}>
            Severity &amp; root causes
          </p>
        </div>
      </header>

      {loading && <SkeletonCard />}

      {!loading && !data && (
        <p style={{ fontSize: "0.82rem", color: "rgba(148,163,184,0.4)", textAlign: "center", padding: "24px 0" }}>
          Select stress triggers above to see your detailed analysis.
        </p>
      )}

      {!loading && data && (
        <div className="animate-fade-in">
          {data.primaryTrigger && (
            <div
              style={{
                borderRadius: "12px",
                background: "rgba(251,191,36,0.07)",
                border: "1px solid rgba(251,191,36,0.18)",
                padding: "10px 14px",
                marginBottom: "16px",
              }}
            >
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "3px" }}>
                Primary Stressor
              </p>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" }}>
                {data.primaryTrigger}
              </p>
            </div>
          )}

          {data.rankedTriggers.length === 0 ? (
            <p style={{ fontSize: "0.83rem", color: "rgba(148,163,184,0.5)", lineHeight: 1.6 }}>
              {data.overallMessage}
            </p>
          ) : (
            data.rankedTriggers.map((item) => (
              <TriggerBar key={item.trigger} item={item} />
            ))
          )}

          {data.overallMessage && data.rankedTriggers.length > 0 && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "rgba(148,163,184,0.4)",
                fontStyle: "italic",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                paddingTop: "12px",
                marginTop: "4px",
                lineHeight: 1.5,
              }}
            >
              {data.overallMessage}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
