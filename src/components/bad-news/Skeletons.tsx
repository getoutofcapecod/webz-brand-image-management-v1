// Hidden from assistive technology: the status line announces the search
// while these rows are purely visual placeholders.
export function Skeletons() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="py-5">
            <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-2 h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-3 h-16 rounded-md bg-zinc-100 dark:bg-zinc-900" />
          </div>
        ))}
      </div>
    </div>
  );
}
