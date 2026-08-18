"use client";

import { TriangleAlertIcon } from "@/components/icons";
import { FOCUS_RING } from "@/lib/constants";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ reset }: ErrorBoundaryProps) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <div
        role="alert"
        className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30"
      >
        <div className="flex gap-3">
          <TriangleAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <h2 className="text-sm font-medium text-red-900 dark:text-red-100">Something went wrong</h2>
            <p className="mt-1 text-sm text-red-800 dark:text-red-200/90">
              This page could not be rendered. Reload the page to try again.
            </p>
            <button
              type="button"
              onClick={reset}
              className={`mt-3 inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-3 text-sm font-medium text-white hover:bg-red-700 ${FOCUS_RING}`}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
