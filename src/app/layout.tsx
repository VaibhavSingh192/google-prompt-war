import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MindSpace — Student Wellness Tracker",
  description:
    "AI-powered mental wellness tracker for students preparing for NEET, JEE, CUET, CAT, GATE, UPSC, and board exams.",
  keywords: ["mental wellness", "student", "NEET", "JEE", "stress tracker", "AI"],
  openGraph: {
    title: "MindSpace — Student Wellness Tracker",
    description:
      "Track your mood, identify stress triggers, and get personalized wellness support.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        {/* Atmospheric background */}
        <div className="bg-scene" aria-hidden="true">
          <div className="orb orb-green" />
          <div className="orb orb-indigo" />
          <div className="orb orb-amber" />
        </div>

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-green focus:text-black focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>
        {children}
        <div id="aria-live" aria-live="polite" aria-atomic="true" className="sr-only" />
      </body>
    </html>
  );
}
