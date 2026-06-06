interface Contact {
  name: string;
  number: string;
  tel: string;
  hours: string;
}

const CONTACTS: Contact[] = [
  { name: "iCall (TISS)",          number: "9152987821",   tel: "9152987821",   hours: "Mon–Sat, 8am–10pm" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", tel: "18602662345",  hours: "24/7 Free" },
  { name: "NIMHANS Helpline",      number: "080-46110007", tel: "08046110007",  hours: "National support" },
  { name: "Snehi India",           number: "044-24640050", tel: "04424640050",  hours: "Mon–Sat, 8am–10pm" },
];

export function CrisisResources() {
  return (
    <section
      aria-labelledby="crisisTitle"
      style={{
        borderRadius: "20px",
        border: "1px solid rgba(251,113,133,0.15)",
        background: "rgba(251,113,133,0.03)",
        padding: "24px",
        backdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span aria-hidden="true" style={{ fontSize: "1.1rem" }}>🆘</span>
        <h2
          id="crisisTitle"
          style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fb7185" }}
        >
          Need Immediate Support?
        </h2>
      </div>

      <p
        style={{
          fontSize: "0.82rem",
          color: "rgba(148,163,184,0.45)",
          marginBottom: "18px",
          lineHeight: 1.65,
        }}
      >
        If you&apos;re feeling overwhelmed, having thoughts of self-harm, or in a mental health
        crisis — please reach out immediately. Help is available right now. You are not alone.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
        }}
      >
        {CONTACTS.map((c) => (
          <div
            key={c.name}
            style={{
              borderRadius: "14px",
              background: "rgba(8,15,30,0.7)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "14px 16px",
              backdropFilter: "blur(10px)",
            }}
          >
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(226,232,240,0.7)", marginBottom: "4px" }}>
              {c.name}
            </p>
            <a
              href={`tel:${c.tel}`}
              aria-label={`Call ${c.name} at ${c.number}`}
              style={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "#fb7185",
                textDecoration: "none",
                display: "block",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.textDecoration = "none"; }}
            >
              {c.number}
            </a>
            <p style={{ fontSize: "0.68rem", color: "rgba(148,163,184,0.3)", marginTop: "3px" }}>
              {c.hours}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
