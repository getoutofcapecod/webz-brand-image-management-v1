import type { NewsSearchResponse, SearchError, SearchRequest } from "./types";
import { ClientSearchError, isAbortError } from "./errors";

function isNewsSearchResponse(value: unknown): value is NewsSearchResponse {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { query?: unknown; totalResults?: unknown; results?: unknown };
  return (
    typeof candidate.query === "string" &&
    typeof candidate.totalResults === "number" &&
    Array.isArray(candidate.results)
  );
}

export async function searchNews(
  request: SearchRequest,
  signal?: AbortSignal,
): Promise<NewsSearchResponse> {
  // The server can take up to ~30s (two 15s attempts). Keep the client from
  // sitting on skeletons that long: whatever the caller's signal does, this
  // request gives up after 20 seconds.
  const timeoutSignal = AbortSignal.timeout(20_000);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  let response: Response;
  try {
    response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: combinedSignal,
    });
  } catch (error) {
    // AbortError propagates unchanged so callers can tell cancellation apart
    // from a real failure.
    if (isAbortError(error)) throw error;
    throw new ClientSearchError("network", 0, "Could not reach the search service.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errorBody = (body ?? {}) as { error?: SearchError };
    throw new ClientSearchError(
      errorBody.error?.code ?? "upstream",
      response.status,
      errorBody.error?.message ?? "The search service returned an unexpected error.",
    );
  }

  if (!isNewsSearchResponse(body)) {
    throw new ClientSearchError("upstream", response.status, "The search service returned an unexpected response.");
  }

  return body;
}
