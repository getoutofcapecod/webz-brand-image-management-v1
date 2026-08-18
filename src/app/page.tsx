import { BadNewsApp } from "@/components/bad-news/BadNewsApp";

export default function Home() {
  return (
    <>
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-widest text-red-600 dark:text-red-400">
            Brand Image Management
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Give me the bad news first.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Type a company, brand, product, or topic and see the negative coverage about it from the last 30 days,
            ranked by relevance. This use case is great for reputation management within companies.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <BadNewsApp />
      </main>
    </>
  );
}
