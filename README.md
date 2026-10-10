# Picture of the Day

NASA's [Astronomy Picture of the Day](https://apod.nasa.gov/apod/astropix.html),
one image (or video) of the universe every day, with its credit and explanation.

Built on [tool-template](https://github.com/An-Be/tool-template): Next.js 16,
React 19, TypeScript, Tailwind 4 and the shared monochrome design system. The
NASA request runs on the server, so the API key never reaches the browser.

## Run it

```bash
npm install
cp .env.example .env   # optional: add a free NASA_API_KEY from https://api.nasa.gov
npm run dev
```

Without a key the app uses NASA's `DEMO_KEY`, which is fine locally but limited
to 30 requests an hour.

## Commands

```bash
npm run dev         # dev server
npm run build       # production build
npm run typecheck   # next typegen + tsc
npm run lint
npm test            # vitest
```

## Deploy

Vercel, region `cle1` (`vercel.json`). Add `NASA_API_KEY` as a Sensitive
environment variable for Production. A push to `main` deploys.

## How it's put together

| File | Does |
| --- | --- |
| `src/lib/server/apod.ts` | fetches today's APOD (server-only, cached for an hour) |
| `src/lib/apod.ts` | validates NASA's response and picks image, video, embed or link; tested |
| `src/components/apod/apod-media.tsx` | renders the media |
| `src/config/csp.ts` | allows `apod.nasa.gov` images/videos and YouTube/Vimeo embeds |

More detail, and how this repo differs from the template, is in
[`AGENTS.md`](./AGENTS.md#this-tool).
