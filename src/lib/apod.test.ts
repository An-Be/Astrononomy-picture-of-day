import { describe, expect, it } from "vitest";
import {
  apodResponseSchema,
  displaySrc,
  formatApodDate,
  htmlToText,
  latestEntry,
  toApod,
  toMedia,
  type ApodEntry,
} from "./apod";

// Shape of science.nasa.gov/wp-json/wp/v2/apod-basic as of October 2026.
const base: ApodEntry = {
  date: "2026-10-05",
  title: "M104: The Sombrero Galaxy's Tidal Streams",
  explanation: "<strong>Explanation:</strong> Why does the Sombrero Galaxy look like a <a href=\"x\">hat</a>?",
  media_type: "image",
  url: "https://science.nasa.gov/image-article/apod-2026-october-5-m104-the-sombrero-galaxys-tidal-streams/",
  hdurl: "https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/october/M104_Vollmer_4222.jpg?w=4222&h=2817&fit=clip&crop=faces%2Cfocalpoint",
  copyright: '<a href="https://app.astrobin.com/u/Fox368">Engelbert Vollmer</a>',
  credit: '<a href="https://app.astrobin.com/u/Fox368">Engelbert Vollmer</a>',
  alt: "A starfield has a bright blobby mess in the middle.",
  permalink: "https://science.nasa.gov/image-article/apod-2026-october-5-m104-the-sombrero-galaxys-tidal-streams/",
};

describe("apodResponseSchema + latestEntry", () => {
  it("accepts the list response and picks the newest day", () => {
    const parsed = apodResponseSchema.parse([
      { ...base, date: "2026-10-03" },
      { ...base, date: "2026-10-05", post_id: 1 },
      { ...base, date: "2026-10-04" },
    ]);
    expect(latestEntry(parsed).date).toBe("2026-10-05");
    expect(latestEntry(parsed)).not.toHaveProperty("post_id");
  });

  it("accepts a single entry", () => {
    expect(latestEntry(apodResponseSchema.parse(base)).title).toBe(base.title);
  });

  it("rejects an empty list and entries without a title", () => {
    expect(apodResponseSchema.safeParse([]).success).toBe(false);
    const { title: _title, ...rest } = base;
    expect(apodResponseSchema.safeParse(rest).success).toBe(false);
  });
});

describe("htmlToText", () => {
  it("strips tags and decodes entities", () => {
    expect(htmlToText('<a href="a">Karl</a> &amp; <a href="b">Ivan</a> (&#x4A;HU)&nbsp;')).toBe("Karl & Ivan (JHU)");
  });
});

describe("toMedia", () => {
  it("uses hdurl for images, scaled down for the page, with NASA's alt text", () => {
    const media = toMedia(base);
    expect(media.kind).toBe("image");
    if (media.kind !== "image") return;
    expect(media.full).toBe(base.hdurl);
    const src = new URL(media.src);
    expect(src.hostname).toBe("assets.science.nasa.gov");
    expect(src.searchParams.get("w")).toBe("1600");
    expect(src.searchParams.get("h")).toBe("1068");
    expect(src.searchParams.get("fit")).toBe("clip");
    expect(media.alt).toBe(base.alt);
  });

  it("still handles the old apod.nasa.gov shape", () => {
    const old = { ...base, url: "https://apod.nasa.gov/apod/image/2303/Doodad.jpg", hdurl: undefined };
    expect(toMedia(old)).toMatchObject({ kind: "image", full: old.url });
  });

  it("embeds YouTube and Vimeo videos", () => {
    const yt = "https://www.youtube.com/embed/abc123?rel=0";
    expect(toMedia({ ...base, media_type: "video", url: yt, hdurl: undefined })).toEqual({ kind: "embed", src: yt });
    const vimeo = "https://player.vimeo.com/video/123";
    expect(toMedia({ ...base, media_type: "video", url: base.permalink, hdurl: vimeo })).toEqual({ kind: "embed", src: vimeo });
  });

  it("plays self-hosted NASA videos natively", () => {
    const mp4 = "https://assets.science.nasa.gov/content/apod/clip.mp4";
    expect(toMedia({ ...base, media_type: "video", url: base.permalink, hdurl: mp4 })).toEqual({ kind: "video", src: mp4 });
  });

  it("links to the article for anything the CSP wouldn't allow inline", () => {
    const link = { kind: "link", href: base.permalink };
    expect(toMedia({ ...base, hdurl: "https://example.com/pic.jpg" })).toEqual(link);
    expect(toMedia({ ...base, hdurl: "http://assets.science.nasa.gov/x.jpg" })).toEqual(link);
    expect(toMedia({ ...base, media_type: "video", hdurl: undefined })).toEqual(link);
    expect(toMedia({ ...base, media_type: "other" })).toEqual(link);
  });
});

describe("displaySrc", () => {
  it("leaves small images and other hosts alone", () => {
    const small = "https://assets.science.nasa.gov/x.jpg?w=960&h=640";
    expect(displaySrc(small)).toBe(small);
    expect(displaySrc("https://apod.nasa.gov/x.jpg")).toBe("https://apod.nasa.gov/x.jpg");
  });
});

describe("toApod", () => {
  it("cleans up explanation and credit", () => {
    const apod = toApod(base);
    expect(apod.explanation).toBe("Why does the Sombrero Galaxy look like a hat?");
    expect(apod.credit).toBe("Engelbert Vollmer");
    expect(apod.pageUrl).toBe(base.permalink);
  });

  it("drops NASA's 'Image Credit:' label", () => {
    const apod = toApod({ ...base, copyright: '<strong>Image Credit:</strong> <a href="x">NASA</a>, JPL-Caltech' });
    expect(apod.credit).toBe("NASA, JPL-Caltech");
  });

  it("falls back to credit, then null", () => {
    expect(toApod({ ...base, copyright: undefined }).credit).toBe("Engelbert Vollmer");
    expect(toApod({ ...base, copyright: undefined, credit: undefined }).credit).toBeNull();
    expect(toApod({ ...base, copyright: " \n" , credit: undefined}).credit).toBeNull();
  });
});

describe("formatApodDate", () => {
  it("formats without shifting the day across time zones", () => {
    expect(formatApodDate("2026-01-01")).toBe("Jan 1, 2026");
  });
});
