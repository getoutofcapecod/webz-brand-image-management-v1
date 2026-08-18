import type { SentimentKey, SentimentView } from "./types";

// News Search API limits (verified against docs.webz.io).
// k: how many results News Search returns per request (default 10, max 50).
export const K = 20;
export const COVERAGE_DAYS = 30;
export const MAX_QUERY_CHARS = 750;
export const MAX_QUERY_WORDS = 100;
export const REQUEST_TIMEOUT_MS = 15_000;

// Demo-grade pacing: 10 searches per IP per minute, in memory.
export const RATE_LIMIT = { max: 10, windowMs: 60_000 };

// Identical searches share one upstream call within this window.
export const CACHE_TTL_MS = 120_000;
export const CACHE_MAX_ENTRIES = 50;

export const VIEWS: Record<SentimentKey, SentimentView> = {
  bad: {
    key: "bad",
    label: "Bad News",
    sentiment: "negative",
    coverageLabel: "Negative coverage",
  },
  neutral: {
    key: "neutral",
    label: "Neutral",
    sentiment: "neutral",
    coverageLabel: "Neutral coverage",
  },
  good: {
    key: "good",
    label: "Good News",
    sentiment: "positive",
    coverageLabel: "Positive coverage",
  },
};

export const VIEW_ORDER: SentimentView[] = [VIEWS.bad, VIEWS.neutral, VIEWS.good];

export const PRESETS = ["OpenAI", "Tesla", "Robinhood", "Microsoft"];

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950";
