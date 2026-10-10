import { describe, expect, it } from "vitest";
import { apodResponseSchema, archiveUrl, formatApodDate, toApod, toMedia, type ApodResponse } from "./apod";

const base: ApodResponse = {
  date: "2023-03-30",
  title: "NGC 4372 and the Dark Doodad",
  explanation: "The delightful Dark Doodad Nebula drifts through southern skies.",
  media_type: "image",
  url: "https://apod.nasa.gov/apod/image/2303/Doodad200mmAPOD1024crop.jpg",
  hdurl: "https://apod.nasa.gov/apod/image/2303/Doodad200mmAPOD.jpg",
};

describe("apodResponseSchema", () => {
  it("accepts a real response and strips unknown keys", () => {
    const parsed = apodResponseSchema.parse({ ...base, service_version: "v1", copyright: "Matias Tomasello" });
    expect(parsed).not.toHaveProperty("service_version");
    expect(parsed.copyright).toBe("Matias Tomasello");
  });

  it("rejects a response without a title", () => {
    const { title: _title, ...rest } = base;
    expect(apodResponseSchema.safeParse(rest).success).toBe(false);
  });
});

describe("toMedia", () => {
  it("shows an apod.nasa.gov image with its HD version", () => {
    expect(toMedia(base)).toEqual({ kind: "image", src: base.url, full: base.hdurl });
  });

  it("falls back to the standard image when hdurl is on another host", () => {
    expect(toMedia({ ...base, hdurl: "https://example.com/big.jpg" })).toEqual({ kind: "image", src: base.url, full: base.url });
  });

  it("embeds YouTube and Vimeo videos", () => {
    const yt = "https://www.youtube.com/embed/abc123?rel=0";
    const vimeo = "https://player.vimeo.com/video/123";
    expect(toMedia({ ...base, media_type: "video", url: yt })).toEqual({ kind: "embed", src: yt });
    expect(toMedia({ ...base, media_type: "video", url: vimeo })).toEqual({ kind: "embed", src: vimeo });
  });

  it("plays self-hosted NASA videos natively", () => {
    const mp4 = "https://apod.nasa.gov/apod/image/2410/clip.mp4";
    expect(toMedia({ ...base, media_type: "video", url: mp4 })).toEqual({ kind: "video", src: mp4 });
  });

  it("links out for anything the CSP wouldn't allow inline", () => {
    const link = { kind: "link", href: "https://apod.nasa.gov/apod/ap230330.html" };
    expect(toMedia({ ...base, url: "https://example.com/pic.jpg" })).toEqual(link);
    expect(toMedia({ ...base, url: "http://apod.nasa.gov/apod/image/x.jpg" })).toEqual(link);
    expect(toMedia({ ...base, media_type: "video", url: "https://example.com/embed/1" })).toEqual(link);
    expect(toMedia({ ...base, media_type: "other", url: undefined })).toEqual(link);
  });
});

describe("toApod", () => {
  it("cleans up NASA's copyright formatting", () => {
    expect(toApod({ ...base, copyright: "\nJane Doe\n& John Roe " }).copyright).toBe("Jane Doe & John Roe");
  });

  it("returns null copyright for public domain pictures", () => {
    expect(toApod(base).copyright).toBeNull();
    expect(toApod({ ...base, copyright: "  \n" }).copyright).toBeNull();
  });
});

describe("archiveUrl", () => {
  it("builds the archive page for a date", () => {
    expect(archiveUrl("2026-10-10")).toBe("https://apod.nasa.gov/apod/ap261010.html");
  });

  it("falls back to today's page for a malformed date", () => {
    expect(archiveUrl("nope")).toBe("https://apod.nasa.gov/apod/astropix.html");
  });
});

describe("formatApodDate", () => {
  it("formats without shifting the day across time zones", () => {
    expect(formatApodDate("2026-01-01")).toBe("Jan 1, 2026");
  });
});
