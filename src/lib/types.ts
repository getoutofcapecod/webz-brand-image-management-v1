// Client-safe normalized types for the News Search flow.
// Side-effect free so both server and client modules can import it.

export type Sentiment = "negative" | "neutral" | "positive";

export type SentimentKey = "bad" | "neutral" | "good";

export interface SentimentView {
  key: SentimentKey;
  label: string;
  sentiment: Sentiment;
  coverageLabel: string;
}

export interface NewsArticle {
  articleId: string;
  url: string;
  title: string;
  publishedAt: string;
  summary?: string;
  domain: string;
}

export interface NewsResult {
  article: NewsArticle;
  excerpt: string;
  sentiment: Sentiment | null;
  language?: string;
  country?: string;
  siteType?: string;
}

export interface NewsSearchResponse {
  query: string;
  totalResults: number;
  results: NewsResult[];
  requestsLeft?: number;
  creditsUsed?: number;
}

export interface SearchRequest {
  topic: string;
  sentiment: Sentiment;
}

export type SearchErrorCode =
  | "validation"
  | "config"
  | "auth"
  | "credits"
  | "blocked"
  | "rate"
  | "upstream"
  | "timeout"
  | "network";

export interface SearchError {
  code: SearchErrorCode;
  message: string;
}
