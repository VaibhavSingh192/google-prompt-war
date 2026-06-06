import { describe, it, expect, beforeEach } from "vitest";
import { saveEntry, loadHistory, clearHistory } from "@/lib/storage";
import type { MoodHistoryEntry } from "@/types";

const entry: MoodHistoryEntry = {
  date: "2026-06-06",
  score: 3,
  exam: "JEE",
  burnoutRisk: "medium",
  timestamp: 1000,
};

describe("storage", () => {
  beforeEach(() => clearHistory());

  it("starts with empty history", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("saves and loads a single entry", () => {
    saveEntry(entry);
    expect(loadHistory()).toEqual([entry]);
  });

  it("maintains insertion order", () => {
    const e2 = { ...entry, timestamp: 2000, date: "2026-06-07" };
    saveEntry(entry);
    saveEntry(e2);
    const history = loadHistory();
    expect(history[0]).toEqual(entry);
    expect(history[1]).toEqual(e2);
  });

  it("keeps at most 30 entries (drops oldest)", () => {
    for (let i = 0; i < 32; i++) {
      saveEntry({ ...entry, timestamp: i, date: `2026-0${(i % 9) + 1}-01` });
    }
    expect(loadHistory()).toHaveLength(30);
  });

  it("ignores corrupt localStorage data", () => {
    localStorage.setItem("mindspace_history", "NOT_JSON");
    expect(loadHistory()).toEqual([]);
  });
});
