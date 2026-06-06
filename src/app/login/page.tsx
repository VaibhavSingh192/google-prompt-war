"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    if (username.trim() === "admin" && password === "admin") {
      document.cookie = "ms_auth=1; path=/; max-age=86400; SameSite=Lax";
      router.push("/");
    } else {
      setError("Invalid username or password. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px", height: "56px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))",
              border: "1px solid rgba(16,185,129,0.3)",
              boxShadow: "0 0 32px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem",
              margin: "0 auto 14px",
              animation: "float 6s ease-in-out infinite",
            }}
            aria-hidden="true"
          >
            🧠
          </div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
              marginBottom: "6px",
            }}
          >
            MindSpace
          </h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(148,163,184,0.45)", fontWeight: 500 }}>
            Student Wellness Tracker · PromptWars 2025
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(14, 24, 44, 0.85)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 24px 48px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: "6px",
            }}
          >
            Welcome back
          </h2>
          <p style={{ fontSize: "0.78rem", color: "rgba(148,163,184,0.45)", marginBottom: "24px" }}>
            Sign in to track your wellness journey
          </p>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="username"
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(148,163,184,0.6)",
                  marginBottom: "8px",
                }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                aria-required="true"
                style={{
                  width: "100%",
                  background: "rgba(7, 18, 36, 0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                  fontFamily: "var(--font-outfit)",
                  fontSize: "0.9rem",
                  padding: "12px 14px",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(16,185,129,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(148,163,184,0.6)",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  style={{
                    width: "100%",
                    background: "rgba(7, 18, 36, 0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                    fontFamily: "var(--font-outfit)",
                    fontSize: "0.9rem",
                    padding: "12px 44px 12px 14px",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(16,185,129,0.5)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(148,163,184,0.4)",
                    fontSize: "0.85rem",
                    padding: "4px",
                    lineHeight: 1,
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                style={{
                  background: "rgba(251,113,133,0.08)",
                  border: "1px solid rgba(251,113,133,0.2)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "0.8rem",
                  color: "#fb7185",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span aria-hidden="true">⚠️</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              aria-label="Sign in"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "12px",
                border: "none",
                fontFamily: "var(--font-outfit)",
                fontSize: "0.92rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: "#000",
                background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #10b981 100%)",
                backgroundSize: "200% 100%",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.3s",
                boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
