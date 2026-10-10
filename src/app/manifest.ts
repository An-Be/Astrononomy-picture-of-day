import type { MetadataRoute } from "next";
import { site } from "@/config/site";

// Add PNG icons (192, 512, maskable) to public/ for a full PWA install;
// see tool-template docs/new-tool.md.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
