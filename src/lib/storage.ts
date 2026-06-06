import type { MoodHistoryEntry } from "@/types";

const STORAGE_KEY = "mindspace_history";
const MAX_ENTRIES = 30;

export function loadHistory(): MoodHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MoodHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: MoodHistoryEntry): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  history.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_ENTRIES)));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
