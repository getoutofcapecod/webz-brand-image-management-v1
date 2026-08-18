import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { COVERAGE_DAYS, K, MAX_QUERY_CHARS, MAX_QUERY_WORDS, RATE_LIMIT } from "@/lib/constants";
import type { SearchError } from "@/lib/types";
import { searchNews, WebzError } from "@/lib/webz";

const SearchBodySchema = z.object({
  topic: z
    .string()
    .trim()
    .min(1, "Enter a topic to search for.")
    .max(MAX_QUERY_CHARS, `Keep the topic under ${MAX_QUERY_CHARS} characters.`)
    .refine((value) => value.split(/\s+/).length <= MAX_QUERY_WORDS, `Keep the topic under ${MAX_QUERY_WORDS} words.`),
  sentiment: z.enum(["negative", "neutral", "positive"]),
});

// Demo-grade per-IP limiter: an in-memory sliding window, reset on restart.
// The map is bounded so a flood of distinct keys cannot grow it without limit.
const hitsByIp = new Map<string, number[]>();
const MAX_TRACKED_IPS = 1_000;
const MAX_BODY_BYTES = 8_192;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  const recent = (hitsByIp.get(ip) ?? []).filter((timestamp) => timestamp > windowStart);
  if (recent.length >= RATE_LIMIT.max) {
    hitsByIp.set(ip, recent);
    return true;
  }
  recent.push(now);
  hitsByIp.set(ip, recent);
  if (hitsByIp.size > MAX_TRACKED_IPS) {
    // Drop entries with no hits inside the window; if that is not enough,
    // evict the oldest keys to stay bounded.
    for (const [candidate, timestamps] of hitsByIp) {
      if (timestamps[timestamps.length - 1] < windowStart) hitsByIp.delete(candidate);
    }
    while (hitsByIp.size > MAX_TRACKED_IPS) {
      const oldest = hitsByIp.keys().next().value;
      if (oldest === undefined) break;
      hitsByIp.delete(oldest);
    }
  }
  return false;
}

// x-real-ip is set by the proxy in front of the app, so it is the trustworthy
// key. x-forwarded-for is client-supplied and must not be trusted as an
// identity: a caller can spoof it to rotate past the limiter.
async function clientIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-real-ip") ?? "unknown";
}

// The API has no end-date filter, so the window is expressed as a
// published_from date only: today minus 30 days, as an ISO calendar date.
function publishedFrom(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - COVERAGE_DAYS);
  return date.toISOString().slice(0, 10);
}

function jsonError(status: number, error: SearchError): NextResponse {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  const ip = await clientIp();
  if (isRateLimited(ip)) {
    return jsonError(429, {
      code: "rate",
      message: "Too many searches from this device. Wait a minute and try again.",
    });
  }

  let rawBody: unknown;
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonError(400, { code: "validation", message: "The request body is too large." });
  }
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, { code: "validation", message: "The request body must be valid JSON." });
  }

  const parsed = SearchBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "The request body is invalid.";
    return jsonError(400, { code: "validation", message });
  }

  const { topic, sentiment } = parsed.data;

  try {
    const response = await searchNews({
      query: topic,
      k: K,
      filters: { sentiment: [sentiment], published_from: publishedFrom() },
    });
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof WebzError) {
      return jsonError(error.status, { code: error.code, message: error.message });
    }
    console.error("[api/search] unexpected error:", error);
    return jsonError(502, { code: "upstream", message: "The search service failed unexpectedly." });
  }
}
