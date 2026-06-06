"use client";

interface Trigger {
  value: string;
  emoji: string;
  label: string;
}

const TRIGGERS: Trigger[] = [
  { value: "Heavy study load",      emoji: "📚", label: "Heavy Study Load" },
  { value: "Performance anxiety",   emoji: "😓", label: "Performance Anxiety" },
  { value: "Peer pressure",         emoji: "👥", label: "Peer Pressure" },
  { value: "Family expectations",   emoji: "👨‍👩‍👦", label: "Family Expectations" },
  { value: "Poor time management",  emoji: "⏰", label: "Time Management" },
  { value: "Sleep issues",          emoji: "😴", label: "Sleep Issues" },
  { value: "Social isolation",      emoji: "🏠", label: "Social Isolation" },
  { value: "Fear of failure",       emoji: "😨", label: "Fear of Failure" },
];

interface Props {
  selected: string[];
  onChange: (triggers: string[]) => void;
}

export function TriggerGrid({ selected, onChange }: Props) {
  function toggle(value: string) {
    onChange(
      selected.includes(value) ? selected.filter((t) => t !== value) : [...selected, value]
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 12px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: checked
                ? "rgba(129,140,248,0.08)"
                : "rgba(255,255,255,0.02)",
              border: checked
                ? "1px solid rgba(129,140,248,0.35)"
                : "1px solid rgba(255,255,255,0.06)",
              boxShadow: checked
                ? "0 0 16px rgba(129,140,248,0.12)"
                : "none",
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(trigger.value)}
              aria-label={trigger.label}
              style={{
                width: "14px",
                height: "14px",
                accentColor: "#818cf8",
                flexShrink: 0,
                cursor: "pointer",
              }}
            />
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: checked ? 600 : 500,
                color: checked ? "#e2e8f0" : "rgba(148,163,184,0.55)",
                transition: "color 0.2s",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {trigger.emoji} {trigger.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
