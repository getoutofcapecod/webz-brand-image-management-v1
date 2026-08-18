import { useId } from "react";

import { SearchIcon } from "@/components/icons";
import { FOCUS_RING, MAX_QUERY_CHARS, PRESETS } from "@/lib/constants";
import type { Sentiment } from "@/lib/types";

interface SearchFormProps {
  topic: string;
  onTopicChange: (value: string) => void;
  onSubmit: (topic: string, sentiment: Sentiment) => void;
  sentiment: Sentiment;
  onPreset: (preset: string) => void;
  disabled: boolean;
}

const LABEL_CLASS =
  "text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

export function SearchForm({
  topic,
  onTopicChange,
  onSubmit,
  sentiment,
  onPreset,
  disabled,
}: SearchFormProps) {
  const inputId = useId();

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(topic, sentiment);
        }}
        className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
      >
        <label htmlFor={inputId} className={LABEL_CLASS}>
          Company, brand, or product
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            type="text"
            value={topic}
            onChange={(event) => onTopicChange(event.target.value)}
            placeholder="e.g. OpenAI"
            maxLength={MAX_QUERY_CHARS}
            autoComplete="off"
            className={`h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 sm:flex-1 ${FOCUS_RING}`}
          />
          <button
            type="submit"
            disabled={disabled || !topic.trim()}
            className={`h-10 w-full rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-500 sm:w-auto ${FOCUS_RING}`}
          >
            <SearchIcon className="mr-2 inline h-4 w-4 align-[-2px]" />
            {sentiment === "negative" ? "Give me the bad news" : "Search coverage"}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Try a topic
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onPreset(preset)}
            disabled={disabled}
            className={`whitespace-nowrap rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-red-400 dark:hover:text-red-300 ${FOCUS_RING}`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
