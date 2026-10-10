import "server-only";
import { apodResponseSchema, latestEntry, toApod, type Apod } from "@/lib/apod";

// APOD moved here from api.nasa.gov/planetary/apod in 2026. Without a date it
// returns the most recent entries; we show the newest.
const APOD_ENDPOINT = "https://science.nasa.gov/wp-json/wp/v2/apod-basic/";
const TIMEOUT_MS = 8000;

export type ApodResult = { ok: true; apod: Apod } | { ok: false };

/**
 * Today's picture, fetched on the server so the NASA key never reaches the
 * browser. Cached for an hour in Next's data cache, which keeps us well under
 * NASA's rate limit (DEMO_KEY is heavily rate-limited).
 * Never throws: any failure becomes { ok: false } and the page shows an error state.
 */
export async function getPictureOfDay(): Promise<ApodResult> {
  // DEMO_KEY works for local dev without signing up; set NASA_API_KEY in production.
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  const url = `${APOD_ENDPOINT}?${new URLSearchParams({ api_key: key })}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      // Status only: the request URL carries the key.
      console.warn(`[apod] NASA responded ${res.status}`);
      return { ok: false };
    }
    const parsed = apodResponseSchema.safeParse(await res.json());
    if (!parsed.success) {
      console.warn("[apod] unexpected response shape");
      return { ok: false };
    }
    return { ok: true, apod: toApod(latestEntry(parsed.data)) };
  } catch (e) {
    console.warn(`[apod] request failed: ${e instanceof Error ? e.name : "unknown"}`);
    return { ok: false };
  }
}
