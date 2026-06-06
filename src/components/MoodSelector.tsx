"use client";

interface MoodOption {
  score: number;
  emoji: string;
  label: string;
  ariaLabel: string;
  color: string;
  glow: string;
}

const MOODS: MoodOption[] = [
  { score: 1, emoji: "😰", label: "Very Stressed", ariaLabel: "Very stressed, score 1 of 5", color: "#fb7185", glow: "rgba(251,113,133,0.3)" },
  { score: 2, emoji: "😟", label: "Anxious",       ariaLabel: "Anxious, score 2 of 5",       color: "#fb923c", glow: "rgba(251,146,60,0.3)" },
  { score: 3, emoji: "😐", label: "Neutral",       ariaLabel: "Neutral, score 3 of 5",       color: "#fbbf24", glow: "rgba(251,191,36,0.3)" },
  { score: 4, emoji: "🙂", label: "Okay",          ariaLabel: "Okay, score 4 of 5",          color: "#a3e635", glow: "rgba(163,230,53,0.3)" },
  { score: 5, emoji: "😊", label: "Good",          ariaLabel: "Good, score 5 of 5",          color: "#34d399", glow: "rgba(52,211,153,0.3)" },
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
    <div role="radiogroup" aria-label="Select your current mood" className="flex gap-2 sm:gap-3">
      {MOODS.map((mood) => {
        const sel = value === mood.score;
        return (
          <button
            key={mood.score}
            role="radio"
            aria-checked={sel}
            aria-label={mood.ariaLabel}
            data-score={mood.score}
            tabIndex={sel || (value === null && mood.score === 1) ? 0 : -1}
            onClick={() => onChange(mood.score)}
            onKeyDown={(e) => handleKeyDown(e, mood.score)}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "14px 6px",
              borderRadius: "18px",
              cursor: "pointer",
              outline: "none",
              background: sel
                ? `linear-gradient(160deg, ${mood.color}18 0%, ${mood.color}08 100%)`
                : "rgba(255,255,255,0.02)",
              border: sel
                ? `1.5px solid ${mood.color}55`
                : "1.5px solid rgba(255,255,255,0.06)",
              boxShadow: sel
                ? `0 0 24px ${mood.glow}, 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`
                : "0 2px 8px rgba(0,0,0,0.25)",
              transform: sel ? "translateY(-4px) scale(1.04)" : "translateY(0) scale(1)",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontSize: "1.75rem",
                lineHeight: 1,
                filter: sel ? `drop-shadow(0 0 8px ${mood.glow})` : "none",
                transition: "filter 0.3s",
              }}
            >
              {mood.emoji}
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: sel ? mood.color : "rgba(148,163,184,0.35)",
                transition: "color 0.3s",
              }}
            >
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
