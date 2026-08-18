import "server-only";

import { z } from "zod";

import { CACHE_MAX_ENTRIES, CACHE_TTL_MS, REQUEST_TIMEOUT_MS } from "./constants";
import { isAbortError } from "./errors";
import type { NewsResult, NewsSearchResponse, SearchErrorCode, Sentiment } from "./types";

const WEBZ_API_URL = "https://api.webz.io/api/news/context";
const TOKEN = process.env.WEBZ_API_TOKEN;

export class WebzError extends Error {
  readonly code: SearchErrorCode;
  readonly status: number;

  constructor(code: SearchErrorCode, status: number, message: string) {
    super(message);
    this.name = "WebzError";
    this.code = code;
    this.status = status;
  }
}

interface WebzRequestBody {
  query: string;
  k: number;
  filters: {
    sentiment: [Sentiment];
    published_from: string;
  };
}

// Response shape verified against docs.webz.io; parsed defensively so a
// changed upstream shape surfaces as a clear error, never as fake results.
const ArticleSchema = z.object({
  article_id: z.string(),
  url: z.string(),
  title: z.string(),
  published_at: z.string(),
  summary: z.string().nullish(),
});

const ChunkSchema = z.object({
  text: z.string(),
});

const MetadataSchema = z.object({
  language: z.string().nullish(),
  country: z.string().nullish(),
  sentiment: z.string().nullish(),
  domain: z.string().nullish(),
  site_type: z.string().nullish(),
});

const ResultSchema = z.object({
  article: ArticleSchema,
  chunk: ChunkSchema.nullish(),
  metadata: MetadataSchema.nullish(),
});

const EnvelopeSchema = z.object({
  query: z.string(),
  total_results: z.number(),
  results: z.array(ResultSchema).nullish(),
  requests_left: z.number().nullish(),
  credits_used: z.number().nullish(),
});

// Identical searches share one promise so duplicate queries never
// double-spend credits. Failures are dropped so the next call can retry.
const cache = new Map<string, { expiresAt: number; promise: Promise<NewsSearchResponse> }>();

function cacheKey(body: WebzRequestBody): string {
  return JSON.stringify(body);
}

function pruneCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt < now) cache.delete(key);
  }
  if (cache.size > CACHE_MAX_ENTRIES) {
    for (const key of cache.keys()) {
      cache.delete(key);
      if (cache.size <= CACHE_MAX_ENTRIES) break;
    }
  }
}

function normalizeSentiment(value: string | undefined): Sentiment | null {
  if (value === "negative" || value === "neutral" || value === "positive") return value;
  return null;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function normalize(envelope: z.infer<typeof EnvelopeSchema>): NewsSearchResponse {
  const results: NewsResult[] = (envelope.results ?? []).map((result) => ({
    article: {
      articleId: result.article.article_id,
      url: result.article.url,
      title: result.article.title,
      publishedAt: result.article.published_at,
      summary: result.article.summary ?? undefined,
      domain: result.metadata?.domain || hostnameOf(result.article.url),
    },
    excerpt: result.chunk?.text ?? result.article.summary ?? "",
    sentiment: normalizeSentiment(result.metadata?.sentiment ?? undefined),
    language: result.metadata?.language ?? undefined,
    country: result.metadata?.country ?? undefined,
    siteType: result.metadata?.site_type ?? undefined,
  }));

  return {
    query: envelope.query,
    totalResults: envelope.total_results,
    results,
    requestsLeft: envelope.requests_left ?? undefined,
    creditsUsed: envelope.credits_used ?? undefined,
  };
}

// Each attempt gets its own 15-second budget so a slow first response
// cannot abort the single retry that follows it.
async function attempt(body: WebzRequestBody): Promise<Response> {
  return fetch(WEBZ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });
}

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string" && body.message.length > 0) return body.message;
  } catch {
    // Fall through to the status-code message.
  }
  return null;
}

async function parseResponse(response: Response): Promise<NewsSearchResponse> {
  if (response.ok) {
    let raw: unknown;
    try {
      raw = await response.json();
    } catch {
      throw new WebzError("upstream", 502, "Webz.io returned an unreadable response.");
    }
    const parsed = EnvelopeSchema.safeParse(raw);
    if (!parsed.success) {
      throw new WebzError("upstream", 502, "Webz.io returned an unexpected response shape.");
    }
    return normalize(parsed.data);
  }

  const message = await readErrorMessage(response);
  switch (response.status) {
    case 400:
      throw new WebzError("validation", 400, message ?? "The query was rejected as too long or invalid.");
    case 401:
      throw new WebzError("auth", 401, "The token is missing, invalid, or lacks the api_news permission.");
    case 402:
      throw new WebzError("credits", 402, "The Webz.io account has insufficient credits for this search.");
    case 403:
      throw new WebzError("blocked", 403, "The Webz.io account is inactive or blocked.");
    case 422:
      throw new WebzError("validation", 422, message ?? "The request body was rejected by Webz.io.");
    case 429:
      throw new WebzError("rate", 429, "Webz.io rate limit reached. Wait a moment and try again.");
    default:
      throw new WebzError("upstream", 502, `Webz.io returned HTTP ${response.status}.`);
  }
}

async function runRequest(body: WebzRequestBody): Promise<NewsSearchResponse> {
  let response: Response;
  try {
    response = await attempt(body);
  } catch (error) {
    if (isAbortError(error)) {
      throw new WebzError("timeout", 504, "Webz.io did not respond within 15 seconds.");
    }
    throw new WebzError("network", 502, "Could not reach the Webz.io API.");
  }

  // Retry transient server errors once. 4xx and 429 are not retried: failed
  // requests are not charged, and those responses are already definitive.
  if (response.status >= 500) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      response = await attempt(body);
    } catch (error) {
      if (isAbortError(error)) {
        throw new WebzError("timeout", 504, "Webz.io did not respond within 15 seconds.");
      }
      throw new WebzError("network", 502, "Could not reach the Webz.io API.");
    }
  }

  return parseResponse(response);
}

export async function searchNews(body: WebzRequestBody): Promise<NewsSearchResponse> {
  if (!TOKEN) {
    throw new WebzError("config", 503, "WEBZ_API_TOKEN is not configured on the server.");
  }

  const key = cacheKey(body);
  const now = Date.now();
  const existing = cache.get(key);
  if (existing && existing.expiresAt > now) return existing.promise;

  const promise = runRequest(body);
  cache.set(key, { expiresAt: now + CACHE_TTL_MS, promise });
  pruneCache();
  promise.catch(() => {
    if (cache.get(key)?.promise === promise) cache.delete(key);
  });
  return promise;
}
