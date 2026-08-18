// Pure formatting helpers. en-US with UTC keeps the client render stable
// across timezones and matches what the server computes.

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatPublishedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatMatchLabel(shown: number, total: number): string {
  return total > shown
    ? `${formatCount(shown)} of ${formatCount(total)} matches`
    : `${formatCount(shown)} matches`;
}
