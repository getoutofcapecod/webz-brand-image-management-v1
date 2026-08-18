import type { SentimentView } from "@/lib/types";

interface EmptyStateProps {
  view: SentimentView;
  topic: string;
}

export function EmptyState({ view, topic }: EmptyStateProps) {
  const isBad = view.key === "bad";

  return (
    <div className="mt-6 rounded-md border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
      <h2
        className={`text-sm font-medium ${
          isBad ? "text-red-700 dark:text-red-300" : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {isBad
          ? `No bad news found for ${topic}`
          : `No ${view.coverageLabel.toLowerCase()} found for ${topic}`}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        {isBad
          ? `Nothing negative about ${topic} matched in the last 30 days. Try a different name, or see neutral or positive coverage.`
          : `No ${view.coverageLabel.toLowerCase()} matched in the last 30 days. Try a different name.`}
      </p>
    </div>
  );
}
