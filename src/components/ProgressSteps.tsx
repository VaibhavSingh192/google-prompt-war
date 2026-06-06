import type { AnalysisPhase } from "@/types";

interface Props {
  phase: AnalysisPhase;
}

const PHASE_ORDER: AnalysisPhase[] = ["idle", "mood", "triggers", "wellness", "done", "error"];

const STEPS = [
  { id: "mood"     as AnalysisPhase, label: "Mood" },
  { id: "triggers" as AnalysisPhase, label: "Triggers" },
  { id: "wellness" as AnalysisPhase, label: "Wellness" },
];

export function ProgressSteps({ phase }: Props) {
  if (phase === "idle" || phase === "done" || phase === "error") return null;

  const currentIdx = PHASE_ORDER.indexOf(phase);

  return (
    <div
      role="status"
      aria-label="Analysis progress"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        justifyContent: "center",
        marginTop: "16px",
      }}
    >
      {STEPS.map((step) => {
        const stepIdx = PHASE_ORDER.indexOf(step.id);
        const isActive = phase === step.id;
        const isDone = currentIdx > stepIdx;

        return (
          <span
            key={step.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              borderRadius: "999px",
              fontSize: "0.73rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              transition: "all 0.3s",
              background: isDone || isActive
                ? "rgba(16,185,129,0.1)"
                : "rgba(255,255,255,0.02)",
              border: isDone || isActive
                ? "1px solid rgba(16,185,129,0.4)"
                : "1px solid rgba(255,255,255,0.07)",
              color: isDone || isActive
                ? "#10b981"
                : "rgba(148,163,184,0.3)",
              boxShadow: isActive
                ? "0 0 16px rgba(16,185,129,0.15)"
                : "none",
              animation: isActive ? "pulse 1.8s ease-in-out infinite" : "none",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: isDone || isActive ? "#10b981" : "rgba(148,163,184,0.2)",
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            {step.label}
            {isDone ? " ✓" : ""}
          </span>
        );
      })}
    </div>
  );
}
