import { z } from "zod";

// NASA's Astronomy Picture of the Day, served by science.nasa.gov since APOD moved
// off apod.nasa.gov / api.nasa.gov in 2026:
//   GET https://science.nasa.gov/wp-json/wp/v2/apod-basic/?api_key=...
// Without a date it returns the most recent entries as an array.
// Pure parsing and normalizing, no fetch: the request lives in src/lib/server/apod.ts.

export const apodEntrySchema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  media_type: z.string(),
  /** The article page for images; may be an embed URL for videos. */
  url: z.string().optional(),
  /** The image itself for images. */
  hdurl: z.string().optional(),
  copyright: z.string().optional(),
  credit: z.string().optional(),
  alt: z.string().optional(),
  permalink: z.string().optional(),
});

export type ApodEntry = z.infer<typeof apodEntrySchema>;

/** One entry, or the list of recent entries the endpoint returns without a date. */
export const apodResponseSchema = z.union([apodEntrySchema, z.array(apodEntrySchema).min(1)]);

/** Hosts we embed videos from. Each one is also listed under frame-src in src/config/csp.ts. */
export const VIDEO_EMBED_HOSTS = ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"] as const;

/** Hosts for images and self-hosted videos. Listed under img-src and media-src in src/config/csp.ts. */
export const APOD_MEDIA_HOSTS = ["assets.science.nasa.gov", "apod.nasa.gov"] as const;

/** Longest edge we ask NASA's image CDN for in the page; the link opens the full image. */
const DISPLAY_WIDTH = 1600;

export type ApodMedia =
  | { kind: "image"; src: string; full: string; alt: string }
  | { kind: "video"; src: string }
  | { kind: "embed"; src: string }
  | { kind: "link"; href: string };

export type Apod = {
  date: string;
  title: string;
  explanation: string;
  credit: string | null;
  pageUrl: string;
  media: ApodMedia;
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/**
 * NASA's fields carry HTML (links, <strong> labels, &amp;). We render plain text,
 * never raw HTML, so this strips tags and decodes entities.
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
      if (code[0] === "#") {
        const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : m;
      }
      return ENTITIES[code.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/** Drops a leading "Explanation:" / "Image Credit:" style label NASA bakes into the text. */
function dropLabel(text: string, labels: string[]): string {
  const re = new RegExp(`^(?:${labels.join("|")})\\s*(?:&\\s*\\w+\\s*)?:\\s*`, "i");
  return text.replace(re, "");
}

/** Picks the newest entry from a list response. */
export function latestEntry(data: z.infer<typeof apodResponseSchema>): ApodEntry {
  if (!Array.isArray(data)) return data;
  return data.reduce((a, b) => (b.date > a.date ? b : a));
}

function parseHttps(url: string | undefined): URL | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}

function isMediaHost(u: URL): boolean {
  return (APOD_MEDIA_HOSTS as readonly string[]).includes(u.hostname);
}

/** The article page for an entry, falling back to APOD's index. */
export function pageUrlFor(raw: ApodEntry): string {
  return parseHttps(raw.permalink)?.href ?? parseHttps(raw.url)?.href ?? "https://science.nasa.gov/apod/";
}

/**
 * A smaller version of a science.nasa.gov dynamic image for the page. The CDN
 * resizes from the w/h query params; we scale both to keep the aspect ratio.
 */
export function displaySrc(full: string, maxWidth = DISPLAY_WIDTH): string {
  const u = new URL(full);
  if (u.hostname !== "assets.science.nasa.gov") return full;
  const w = Number(u.searchParams.get("w"));
  const h = Number(u.searchParams.get("h"));
  if (!w || !h || w <= maxWidth) return full;
  u.searchParams.set("w", String(maxWidth));
  u.searchParams.set("h", String(Math.round((h * maxWidth) / w)));
  return u.href;
}

/**
 * Picks how to show the day's media. Only https URLs on hosts the CSP allows are
 * rendered inline; anything else becomes a link to NASA's page so the page never
 * trips the CSP.
 */
export function toMedia(raw: ApodEntry): ApodMedia {
  const fallback: ApodMedia = { kind: "link", href: pageUrlFor(raw) };
  const hd = parseHttps(raw.hdurl);
  const url = parseHttps(raw.url);

  if (raw.media_type === "image") {
    // New API: the image is hdurl (url is the article). Old API: url was the image.
    const img = hd && isMediaHost(hd) ? hd : url && isMediaHost(url) ? url : null;
    if (!img) return fallback;
    const alt = raw.alt ? htmlToText(raw.alt) : htmlToText(raw.title);
    return { kind: "image", src: displaySrc(img.href), full: img.href, alt };
  }

  if (raw.media_type === "video") {
    for (const u of [url, hd]) {
      if (!u) continue;
      if ((VIDEO_EMBED_HOSTS as readonly string[]).includes(u.hostname)) return { kind: "embed", src: u.href };
      if (isMediaHost(u) && /\.(mp4|webm)$/i.test(u.pathname)) return { kind: "video", src: u.href };
    }
  }
  return fallback;
}

export function toApod(raw: ApodEntry): Apod {
  const credit = htmlToText(raw.copyright || raw.credit || "");
  return {
    date: raw.date,
    title: htmlToText(raw.title),
    explanation: dropLabel(htmlToText(raw.explanation), ["Explanation"]),
    credit: dropLabel(credit, ["Image Credit", "Video Credit", "Credit", "Copyright"]) || null,
    pageUrl: pageUrlFor(raw),
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
