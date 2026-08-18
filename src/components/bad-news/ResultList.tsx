import { formatMatchLabel } from "@/lib/format";
import type { NewsSearchResponse, SentimentView } from "@/lib/types";

import { ResultCard } from "./ResultCard";

interface ResultListProps {
  view: SentimentView;
  response: NewsSearchResponse;
}

/** ", 1 credit used, 998 left" style suffix, or empty when unknown. */
function creditSummary(response: NewsSearchResponse): string {
  if (response.creditsUsed === undefined && response.requestsLeft === undefined) return "";
  const parts: string[] = [];
  if (response.creditsUsed !== undefined) parts.push(`${response.creditsUsed} credit${response.creditsUsed === 1 ? "" : "s"} used`);
  if (response.requestsLeft !== undefined) parts.push(`${response.requestsLeft} left`);
  return `, ${parts.join(", ")}`;
}

export function ResultList({ view, response }: ResultListProps) {
  const isBad = view.key === "bad";
  const matchLabel = formatMatchLabel(response.results.length, response.totalResults);

  return (
    <section className="mt-6" aria-label={`${view.label} results`}>
      {isBad ? (
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-red-700 dark:text-red-400">
            Bad news about {response.query}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {matchLabel} from the last 30 days{creditSummary(response)}.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-base font-medium text-zinc-700 dark:text-zinc-300">
            {view.coverageLabel} for {response.query}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {matchLabel} from the last 30 days{creditSummary(response)}.
          </p>
        </div>
      )}

      <ul className="mt-4 divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {response.results.map((result) => (
          <ResultCard key={result.article.articleId} result={result} view={view} />
        ))}
      </ul>
    </section>
  );
}
