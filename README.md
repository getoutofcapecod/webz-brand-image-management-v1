# Brand Image Management

A small Next.js demo for the [Webz.io News Search API](https://docs.webz.io/), meant as a reference for developers evaluating or integrating the API. Type a company, brand, product, or topic and see the most relevant recent coverage (the last 30 days), defaulting to negative sentiment first. Every result shows the matching passage and links to the original article, which makes it a handy tool for image and reputation management.

## Quick start

```bash
npm install
cp .env.example .env.local   # then set WEBZ_API_TOKEN
npm run dev                  # http://localhost:3000
```

Get a token from [app.webz.io](https://app.webz.io). The app needs the `api_news` permission and a positive credit balance. News Search is billed per call; the free plan's $5/month is plenty.

Without a token the app still boots, it just shows the configuration error on search.

## The API call

The app makes one request per search, always with `k` fixed at 20 and a sentiment filter:

```bash
curl -X POST "https://api.webz.io/api/news/context" \
  -H "Authorization: Bearer $WEBZ_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Boeing",
    "k": 20,
    "filters": {
      "sentiment": ["negative"],
      "published_from": "2026-07-18"
    }
  }'
```

The API has no end-date filter, so the 30-day window is expressed as `published_from` only (today minus 30 days, as an ISO date). Each result pairs the article with the matching passage (`chunk.text`, falling back to the article summary when the API returns no passage) and its sentiment:

```jsonc
{
  "query": "Boeing",
  "total_results": 320,
  "results": [
    {
      "article": {
        "article_id": "a83e94d1…",
        "url": "https://example.com/article",
        "title": "Example article",
        "published_at": "2026-08-05T14:30:00Z"
      },
      "chunk": { "chunk_id": "…", "text": "The matching passage." },
      "metadata": {
        "sentiment": "negative",
        "domain": "example.com",
        "site_type": "news"
      }
    }
  ],
  "requests_left": 998,
  "credits_used": 1
}
```

`lib/webz.ts` normalises that into the camelCase shapes in `lib/types.ts`. To test against the app's own endpoint instead of Webz.io directly:

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"topic":"Boeing","sentiment":"negative"}'
```

## Architecture

```
Browser (Client Component)                 Server
┌──────────────────────────┐      ┌─────────────────────────────────────┐
│ BadNewsApp ──POST /api/search──▶│ Route Handler (zod + rate limit)     │
│   (state, results, errors)      │   └─▶ lib/webz.ts  (server-only)     │
│   │                             │         └─▶ POST api.webz.io/api/    │
│   └──── JSON results ───────────┘                 news/context         │
└──────────────────────────┘      └─────────────────────────────────────┘
```

The page is a static server shell and no query runs on mount, so opening it doesn't cost a credit. Searching happens in the client island at `src/components/bad-news/BadNewsApp.tsx`, which POSTs to `/api/search`. The route validates the body with zod, applies a per-IP rate limit, computes `published_from` as today minus 30 days, and hands off to `lib/webz.ts`. That module imports `server-only`, so the token never reaches the browser.

The three-way Bad News / Neutral / Good News control maps directly onto the `sentiment` filter, so switching views runs a new search rather than re-filtering old results.

## Keeping costs down

The API bills per call, so the app avoids wasting them. No query runs on page load. Identical searches are coalesced and cached for two minutes, so double-clicks or re-picked presets share one billed call rather than racing. A new search aborts the previous in-flight request, which also stops a slow response from overwriting fresher results.

Only 5xx responses are retried (once, after a short pause); failed requests aren't charged. There's a 15-second timeout on the upstream call, and a per-IP rate limit on `/api/search` to keep a runaway script from draining the account. The limiter is in-memory and resets on restart, not production-grade, but good enough for a demo. Only successful responses go in the cache, so failures always retry for real.

## Errors

The app's endpoint returns errors as `{ "error": { "code", "message" } }`.

| Status | What it means |
| --- | --- |
| 400 | Invalid body: not JSON, empty topic, or over 750 chars / 100 words |
| 401 | Token missing, invalid, or lacks the `api_news` permission |
| 402 | Out of credits |
| 403 | Account inactive or blocked |
| 429 | Rate-limited (app's per-IP limit or Webz.io's) |
| 502 | Upstream failure: unreadable or unexpected response, network error |
| 503 | `WEBZ_API_TOKEN` not set on the server |
| 504 | Webz.io did not respond within 15 seconds |

As on the other two apps, 429 only means rate limiting here, not credit exhaustion (that's 402).

## Project layout

```
src/
├── app/
│   ├── api/search/route.ts   # POST endpoint: validate → rate-limit → call → JSON
│   ├── layout.tsx            # root layout + Geist fonts + metadata
│   ├── page.tsx              # static shell, no query on open
│   └── error.tsx             # client error boundary
├── components/
│   ├── bad-news/
│   │   ├── BadNewsApp.tsx    # client island: state + search orchestration
│   │   ├── SearchForm.tsx    # topic input, presets, submit
│   │   ├── ViewLinks.tsx     # Bad News / Neutral / Good News switcher
│   │   ├── ResultList.tsx    # results header + list
│   │   ├── ResultCard.tsx    # single result
│   │   ├── Skeletons.tsx     # loading placeholder
│   │   ├── StatusLine.tsx    # polite live region for search state
│   │   ├── ErrorPanel.tsx    # error state
│   │   └── EmptyState.tsx    # no-results state
│   └── icons.tsx             # shared SVG icons
└── lib/
    ├── constants.ts          # k, window, rate limit, cache, presets, views
    ├── errors.ts             # shared client error + abort detection
    ├── types.ts              # shared types (safe to import from client code)
    ├── format.ts             # date and match-count formatting
    ├── client-search.ts      # browser-side fetch wrapper for /api/search
    └── webz.ts               # server-only Webz.io client
```

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and zod.

## Out of scope

This is a demo, not a service. If you're going to production you'd want real auth on `/api/search`, a shared rate limiter (not in-memory), observability, and probably a persistence layer for results older than the API's 30-day window.

## License

MIT
