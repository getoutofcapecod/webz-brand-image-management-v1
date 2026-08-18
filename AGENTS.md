## Project conventions

- Next.js 16 App Router. The page shell is a server component; only `src/components/bad-news/BadNewsApp.tsx` is a client island.
- Webz.io calls happen only in `src/lib/webz.ts`, which imports `server-only`. The API token lives in `WEBZ_API_TOKEN` and is read server-side only.
- Route boundary: `src/app/api/search/route.ts` validates with zod and rate-limits per IP in memory.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` before finishing.
- Project-wide bans: no em dashes, no debug logging, no implicit `any`, no placeholder markers, no history comments.
