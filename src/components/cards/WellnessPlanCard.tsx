import type { WellnessPlan } from "@/types";
import { SkeletonCard } from "./SkeletonCard";

function Section({ title, items, extra }: { title: string; items: string[]; extra?: string }) {
  return (
    <div className="wellness-section" style={{ marginBottom: "10px" }}>
      <p className="wellness-section-title">{title}</p>
      <ul style={{ listStyle: "none" }}>
        {items.map((item, i) => (
          <p key={i} className="wellness-step">{item}</p>
        ))}
      </ul>
      {extra && (
        <p style={{ fontSize: "0.7rem", color: "rgba(16,185,129,0.7)", fontWeight: 600, marginTop: "6px" }}>
          {extra}
        </p>
      )}
    </div>
  );
}

interface Props {
  data: WellnessPlan | null;
  loading: boolean;
}

export function WellnessPlanCard({ data, loading }: Props) {
  return (
    <article
      className="glass glow-green animate-fade-in"
      style={{
        borderRadius: "20px",
        padding: "24px",
        borderTop: "2px solid rgba(16,185,129,0.4)",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div
          aria-hidden="true"
          style={{
            width: "36px", height: "36px",
            borderRadius: "10px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
          }}
        >🌱</div>
        <div>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0" }}>Your Wellness Plan</h2>
          <p style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.45)", marginTop: "1px" }}>
            Personalized action steps
          </p>
        </div>
      </header>

      {loading && <SkeletonCard />}

      {!loading && !data && (
        <p style={{ fontSize: "0.82rem", color: "rgba(148,163,184,0.4)", textAlign: "center", padding: "24px 0" }}>
          Your personalized wellness plan will appear here after the analysis.
        </p>
      )}

      {!loading && data && (
        <div className="animate-fade-in">
          <Section
            title={`⚡ ${data.immediateAction.title}`}
            items={data.immediateAction.steps}
            extra={`Duration: ${data.immediateAction.duration}`}
          />
          <Section title={`📖 ${data.studyStrategy.title}`} items={data.studyStrategy.tips} />
          <Section title={`🌿 ${data.selfCare.title}`} items={data.selfCare.activities} />

          <div className="motivation-box" style={{ marginTop: "12px" }}>
            <blockquote
              role="note"
              aria-label="Motivational message"
              style={{
                fontStyle: "italic",
                fontSize: "0.84rem",
                color: "rgba(226,232,240,0.85)",
                lineHeight: 1.65,
              }}
            >
              &ldquo;{data.motivationalMessage}&rdquo;
            </blockquote>
            {data.weeklyGoal && (
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "#10b981",
                  fontWeight: 700,
                  marginTop: "10px",
                }}
              >
                🎯 This week: {data.weeklyGoal}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
