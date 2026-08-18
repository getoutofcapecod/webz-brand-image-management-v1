import { TriangleAlertIcon } from "@/components/icons";
import type { SearchError, SearchErrorCode } from "@/lib/types";

const ERROR_TITLES: Record<SearchErrorCode, string> = {
  validation: "Invalid search",
  config: "Search is not configured",
  auth: "Authentication failed",
  credits: "Out of credits",
  blocked: "Account unavailable",
  rate: "Too many requests",
  upstream: "Webz.io is unavailable",
  timeout: "The search timed out",
  network: "No connection to the search service",
};

interface ErrorPanelProps {
  error: SearchError;
}

export function ErrorPanel({ error }: ErrorPanelProps) {
  return (
    <div
      role="alert"
      className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30"
    >
      <div className="flex gap-3">
        <TriangleAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <h2 className="text-sm font-medium text-red-900 dark:text-red-100">{ERROR_TITLES[error.code]}</h2>
          <p className="mt-1 text-sm text-red-800 dark:text-red-200/90">{error.message}</p>
        </div>
      </div>
    </div>
  );
}
