"use client";

import { useCallback, useRef, useState } from "react";

import { VIEWS } from "@/lib/constants";
import { searchNews } from "@/lib/client-search";
import { ClientSearchError, isAbortError } from "@/lib/errors";
import type { NewsSearchResponse, SearchError, Sentiment, SentimentKey } from "@/lib/types";

import { EmptyState } from "./EmptyState";
import { ErrorPanel } from "./ErrorPanel";
import { ResultList } from "./ResultList";
import { SearchForm } from "./SearchForm";
import { Skeletons } from "./Skeletons";
import { StatusLine } from "./StatusLine";
import { ViewLinks } from "./ViewLinks";

type AppState = "idle" | "loading" | "success" | "error";

function toSearchError(caught: unknown): SearchError {
  if (caught instanceof ClientSearchError) {
    return { code: caught.code, message: caught.message };
  }
  return { code: "upstream", message: "The search failed for an unknown reason." };
}

export function BadNewsApp() {
  const [topic, setTopic] = useState("");
  const [submittedTopic, setSubmittedTopic] = useState("");
  const [viewKey, setViewKey] = useState<SentimentKey>("bad");
  const [state, setState] = useState<AppState>("idle");
  const [response, setResponse] = useState<NewsSearchResponse | null>(null);
  const [error, setError] = useState<SearchError | null>(null);

  const searchIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const view = VIEWS[viewKey];

  const runSearch = useCallback(async (topicValue: string, sentiment: Sentiment) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const searchId = ++searchIdRef.current;

    setState("loading");
    setSubmittedTopic(topicValue);
    setError(null);

    try {
      const result = await searchNews({ topic: topicValue, sentiment }, controller.signal);
      if (searchId !== searchIdRef.current) return;
      setResponse(result);
      setState("success");
    } catch (caught) {
      if (searchId !== searchIdRef.current) return;
      if (isAbortError(caught)) return;
      setError(toSearchError(caught));
      setState("error");
    }
  }, []);

  const handleSubmit = useCallback(
    (topicValue: string, sentiment: Sentiment) => {
      if (!topicValue.trim()) return;
      runSearch(topicValue.trim(), sentiment);
    },
    [runSearch],
  );

  const handleViewChange = useCallback(
    (key: SentimentKey) => {
      setViewKey(key);
      const currentTopic = topic.trim();
      if (currentTopic) runSearch(currentTopic, VIEWS[key].sentiment);
    },
    [runSearch, topic],
  );

  const handlePreset = useCallback(
    (preset: string) => {
      setTopic(preset);
      runSearch(preset, VIEWS[viewKey].sentiment);
    },
    [runSearch, viewKey],
  );

  return (
    <div>
      <SearchForm
        topic={topic}
        onTopicChange={setTopic}
        onSubmit={handleSubmit}
        sentiment={view.sentiment}
        onPreset={handlePreset}
        disabled={state === "loading"}
      />

      <div className="mt-10" aria-busy={state === "loading"}>
        <StatusLine state={state} view={view} topic={submittedTopic} response={response} />

        {state === "loading" && (
          <div className="mt-6">
            <Skeletons />
          </div>
        )}

        {state === "success" && response && response.results.length === 0 && (
          <>
            <EmptyState view={view} topic={response.query} />
            <ViewLinks viewKey={viewKey} onViewChange={handleViewChange} />
          </>
        )}

        {state === "success" && response && response.results.length > 0 && (
          <>
            <ResultList view={view} response={response} />
            <ViewLinks viewKey={viewKey} onViewChange={handleViewChange} />
          </>
        )}

        {state === "error" && error && <ErrorPanel error={error} />}

        {state === "idle" && (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            Type a company, brand, or product to see what the news is saying about it, starting with the worst.
          </p>
        )}
      </div>
    </div>
  );
}
