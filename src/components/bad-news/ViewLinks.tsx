import { FOCUS_RING, VIEW_ORDER } from "@/lib/constants";
import type { SentimentKey } from "@/lib/types";

interface ViewLinksProps {
  viewKey: SentimentKey;
  onViewChange: (key: SentimentKey) => void;
}

function linkLabel(viewKey: SentimentKey): string {
  if (viewKey === "bad") return "bad news";
  if (viewKey === "neutral") return "neutral coverage";
  return "positive coverage";
}

export function ViewLinks({ viewKey, onViewChange }: ViewLinksProps) {
  const others = VIEW_ORDER.filter((view) => view.key !== viewKey);

  return (
    <p className="mt-5 text-sm text-zinc-500 dark:text-zinc-400">
      Also see:{" "}
      {others.map((view, index) => (
        <span key={view.key}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          <button
            type="button"
            onClick={() => onViewChange(view.key)}
            className={`font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300 ${FOCUS_RING}`}
          >
            {linkLabel(view.key)}
          </button>
        </span>
      ))}
    </p>
  );
}
