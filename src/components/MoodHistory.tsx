"use client";

import { useEffect, useState } from "react";
import type { MoodHistoryEntry } from "@/types";
import { loadHistory } from "@/lib/storage";

const BAR_CLASSES = ["", "history-bar-1", "history-bar-2", "history-bar-3", "history-bar-4", "history-bar-5"];
const BAR_GLOW = ["", "rgba(251,113,133,0.4)", "rgba(251,146,60,0.4)", "rgba(251,191,36,0.4)", "rgba(163,230,53,0.4)", "rgba(52,211,153,0.4)"];

export function MoodHistory() {
  const [history, setHistory] = useState<MoodHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory().slice(-7));
  }, []);

  return (
    <section
      aria-labelledby="historyTitle"
      className="glass"
      style={{ borderRadius: "20px", padding: "24px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 id="historyTitle" style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0" }}>
          📈 Mood History
        </h2>
        <span style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.35)", fontWeight: 500 }}>
          Last 7 check-ins
        </span>
      </div>

      {history.length === 0 ? (
        <p style={{ fontSize: "0.82rem", color: "rgba(148,163,184,0.3)", textAlign: "center", padding: "28px 0" }}>
          Complete your first check-in to see your mood trend here.
        </p>
      ) : (
        <figure
          role="img"
          aria-label={`Mood history. ${history.length} check-ins shown.`}
          style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "90px", padding: "0 4px" }}
        >
          {history.map((entry, i) => {
            const heightPct = (entry.score / 5) * 74 + 14;
            const cls = BAR_CLASSES[entry.score] ?? BAR_CLASSES[3];
            const glow = BAR_GLOW[entry.score] ?? BAR_GLOW[3];
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div
                  className={cls}
                  style={{
                    width: "100%",
                    height: `${heightPct}px`,
                    borderRadius: "6px 6px 0 0",
                    transition: "height 0.6s cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: `0 0 12px ${glow}`,
                  }}
                  role="img"
                  aria-label={`Score ${entry.score} on ${entry.date}`}
                  title={`${entry.exam} — ${entry.score}/5 on ${entry.date}`}
                />
                <span style={{ fontSize: "0.6rem", color: "rgba(148,163,184,0.3)" }}>
                  {entry.date.slice(5)}
                </span>
              </div>
            );
          })}
        </figure>
      )}
    </section>
  );
}
