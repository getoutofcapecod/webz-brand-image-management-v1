import type { SearchErrorCode } from "./types";

/**
 * Client-side search error. Carries the HTTP status and a stable code so the
 * UI can present a message without guessing from the status alone.
 */
export class ClientSearchError extends Error {
  readonly code: SearchErrorCode;
  readonly status: number;

  constructor(code: SearchErrorCode, status: number, message: string) {
    super(message);
    this.name = "ClientSearchError";
    this.code = code;
    this.status = status;
  }
}

/**
 * True when a request was cancelled rather than failed. AbortSignal.timeout()
 * rejects with a TimeoutError while an explicit abort rejects with an
 * AbortError, so both names must be treated as cancellation.
 */
export function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  );
}
