// lib/algo/scoring.ts
import type { SignalType } from "../types";

// Positive signals build affinity, negative ones suppress it.
// completed_book counts far more than a single read_chapter — finishing
// a book is the strongest possible taste signal we have.
export const SIGNAL_WEIGHTS: Record<SignalType, number> = {
  completed_book: 5,
  purchased_chapter: 4,
  reviewed: 3,
  shared: 3,
  tag_clicked: 2,
  search_query: 2,
  read_chapter: 1,
  time_on_page: 0.5, // multiplied by minutes, capped — see weightForSignal
  skipped_chapter: -1,
  abandoned_book: -2,
};

const HALF_LIFE_DAYS = 21; // a signal's influence halves every 3 weeks

export function recencyDecay(createdAt: Date, now: Date = new Date()): number {
  const ageDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
}

export function weightForSignal(signal: SignalType, payload: Record<string, unknown>): number {
  if (signal === "time_on_page") {
    const seconds = typeof payload.seconds === "number" ? payload.seconds : 0;
    return Math.min(seconds / 60, 10) * SIGNAL_WEIGHTS.time_on_page; // cap at 10 minutes worth
  }
  return SIGNAL_WEIGHTS[signal] ?? 0;
}