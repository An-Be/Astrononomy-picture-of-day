import { z } from "zod";

// NASA's Astronomy Picture of the Day API (https://api.nasa.gov, "APOD").
// Pure parsing and normalizing, no fetch: the request lives in src/lib/server/apod.ts.

export const apodResponseSchema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  media_type: z.string(),
  url: z.url().optional(),
  hdurl: z.url().optional(),
  copyright: z.string().optional(),
});

export type ApodResponse = z.infer<typeof apodResponseSchema>;

/** Hosts we embed videos from. Each one is also listed under frame-src in src/config/csp.ts. */
export const VIDEO_EMBED_HOSTS = ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"] as const;

/** Host for images and self-hosted videos. Listed under img-src and media-src in src/config/csp.ts. */
export const APOD_MEDIA_HOST = "apod.nasa.gov";

export type ApodMedia =
  | { kind: "image"; src: string; full: string }
  | { kind: "video"; src: string }
  | { kind: "embed"; src: string }
  | { kind: "link"; href: string };

export type Apod = {
  date: string;
  title: string;
  explanation: string;
  copyright: string | null;
  media: ApodMedia;
};

/** The APOD archive page for a date, e.g. 2026-10-10 → https://apod.nasa.gov/apod/ap261010.html */
export function archiveUrl(date: string): string {
  const m = /^\d{2}(\d{2})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return "https://apod.nasa.gov/apod/astropix.html";
  return `https://apod.nasa.gov/apod/ap${m[1]}${m[2]}${m[3]}.html`;
}

function hostOf(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.hostname : null;
  } catch {
    return null;
  }
}

/**
 * Picks how to show the day's media. Only https URLs on hosts the CSP allows are
 * rendered inline; anything else (an odd host, media_type "other", no url)
 * becomes a link to NASA's own page so the page never trips the CSP.
 */
export function toMedia(raw: ApodResponse): ApodMedia {
  const fallback: ApodMedia = { kind: "link", href: archiveUrl(raw.date) };
  if (!raw.url) return fallback;
  const host = hostOf(raw.url);
  if (!host) return fallback;

  if (raw.media_type === "image" && host === APOD_MEDIA_HOST) {
    const full = raw.hdurl && hostOf(raw.hdurl) === APOD_MEDIA_HOST ? raw.hdurl : raw.url;
    return { kind: "image", src: raw.url, full };
  }
  if (raw.media_type === "video") {
    if (host === APOD_MEDIA_HOST && /\.(mp4|webm)$/i.test(new URL(raw.url).pathname)) {
      return { kind: "video", src: raw.url };
    }
    if ((VIDEO_EMBED_HOSTS as readonly string[]).includes(host)) return { kind: "embed", src: raw.url };
  }
  return fallback;
}

export function toApod(raw: ApodResponse): Apod {
  // NASA sends copyright with stray newlines and leading spaces.
  const copyright = raw.copyright?.replace(/\s+/g, " ").trim() || null;
  return {
    date: raw.date,
    title: raw.title.trim(),
    explanation: raw.explanation.trim(),
    copyright,
    media: toMedia(raw),
  };
}

/** "2026-10-10" → "Oct 10, 2026", read as a calendar date (no time zone shift). */
export function formatApodDate(date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return date;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
