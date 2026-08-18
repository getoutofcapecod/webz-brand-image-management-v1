import { formatMatchLabel } from "@/lib/format";
import type { NewsSearchResponse, SentimentView } from "@/lib/types";

interface StatusLineProps {
  state: "idle" | "loading" | "success" | "error";
  view: SentimentView;
  topic: string;
  response: NewsSearchResponse | null;
}

// The polite live region for search state changes. It announces a short
// state change on success; the results heading that follows carries the full
// "Bad news about X" framing, so repeating it here would announce it twice.
export function StatusLine({ state, view, topic, response }: StatusLineProps) {
  if (state === "idle" || state === "error") return null;

  const isBad = view.key === "bad";

  let text: string;
  if (state === "loading") {
    text = isBad
      ? `Getting the bad news about ${topic}...`
      : `Looking for ${view.coverageLabel.toLowerCase()} about ${topic}...`;
  } else if (response && response.results.length > 0) {
    const matchLabel = formatMatchLabel(response.results.length, response.totalResults);
    text = `${matchLabel}, from the last 30 days.`;
  } else {
    text = isBad
      ? `No bad news found for ${topic} in the last 30 days.`
      : `No ${view.coverageLabel.toLowerCase()} found for ${topic} in the last 30 days.`;
  }

  return (
    <p role="status" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {text}
    </p>
  );
}
