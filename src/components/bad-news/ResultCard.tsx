import { ExternalLinkIcon } from "@/components/icons";
import { FOCUS_RING } from "@/lib/constants";
import { formatPublishedDate } from "@/lib/format";
import type { NewsResult, Sentiment, SentimentView } from "@/lib/types";

const SENTIMENT_TEXT: Record<Sentiment, string> = {
  negative: "text-red-700 dark:text-red-300",
  neutral: "text-zinc-500 dark:text-zinc-400",
  positive: "text-emerald-700 dark:text-emerald-300",
};

const SENTIMENT_LABELS: Record<Sentiment, string> = {
  negative: "Negative",
  neutral: "Neutral",
  positive: "Positive",
};

const EXTERNAL_URL = /^https?:\/\//i;

interface ResultCardProps {
  result: NewsResult;
  view: SentimentView;
}

export function ResultCard({ result, view }: ResultCardProps) {
  // The API is filtered by the view's sentiment; the label falls back to the
  // view when a result carries no parseable sentiment of its own.
  const sentiment = result.sentiment ?? view.sentiment;

  // Only render links for http(s) URLs. Anything else is treated as data, not
  // a navigation target, so a malformed value cannot become a javascript: link.
  const articleUrl = result.article?.url ?? "";
  const url = EXTERNAL_URL.test(articleUrl) ? articleUrl : null;
  const title = result.article?.title ?? "Untitled article";
  const domain = result.article?.domain || "unknown source";
  const publishedAt = result.article?.publishedAt ?? "";

  return (
    <li className="py-5">
      <h3 className="break-words text-base font-medium leading-snug">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100 ${FOCUS_RING}`}
          >
            {title}
            <ExternalLinkIcon className="ml-1 inline h-3.5 w-3.5 -translate-y-px text-zinc-500" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          title
        )}
      </h3>
      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        {domain}
        <span aria-hidden="true"> · </span>
        <time dateTime={publishedAt || undefined}>
          {formatPublishedDate(publishedAt)}
        </time>
        <span aria-hidden="true"> · </span>
        <span className={`font-medium ${SENTIMENT_TEXT[sentiment]}`}>
          {SENTIMENT_LABELS[sentiment]}
        </span>
      </p>
      {result.excerpt?.trim() && (
        <p className="mt-3 break-words rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
          {result.excerpt}
        </p>
      )}
    </li>
  );
}
