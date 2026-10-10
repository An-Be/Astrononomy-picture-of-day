import { posthogCsp } from "@/lib/analytics";
import { mergeDirectives, type CspDirectives } from "@/lib/csp";

// Per-tool additions to the Content-Security-Policy, merged into the strict
// defaults in src/lib/csp.ts. Add only the origins a feature actually needs and
// say why next to each one. Hosts here must match APOD_MEDIA_HOST and
// VIDEO_EMBED_HOSTS in src/lib/apod.ts, which decide what renders inline.
export const cspAllowlist: CspDirectives = mergeDirectives(
  {
    "img-src": ["https://apod.nasa.gov"], // the day's picture
    "media-src": ["https://apod.nasa.gov"], // self-hosted APOD videos (.mp4)
    "frame-src": [
      "https://www.youtube.com", // most APOD videos are YouTube embeds
      "https://www.youtube-nocookie.com", // privacy-enhanced YouTube embeds
      "https://player.vimeo.com", // occasional Vimeo embeds
    ],
  },
  // PostHog ingest + its lazy-loaded scripts; empty when analytics is off.
  posthogCsp(process.env.NEXT_PUBLIC_POSTHOG_HOST),
);
