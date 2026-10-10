// The one file to edit when spinning up a new tool from this template.
// Everything user-facing that names the tool reads from here.
export const site = {
  name: "Picture of the Day",
  description: "NASA's Astronomy Picture of the Day, one image of the universe every day.",
  /** Shown in the footer. Keep it short. */
  tagline: "Data from NASA APOD.",
  /** Footer credit link. */
  author: { name: "Andrea", url: "https://andreaberrocal.com" },
  /** Browser UI color. Paper white keeps the monochrome look. */
  themeColor: "#ffffff",
  /**
   * Secret-link tools should stay out of search engines. Flip to true only for a
   * tool whose pages are meant to be public.
   */
  indexable: true,
} as const;
