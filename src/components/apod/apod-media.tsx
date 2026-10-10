import type { ApodMedia } from "@/lib/apod";
import { buttonVariants } from "@/components/ui/button";

/**
 * Renders the day's picture or video. Only media that src/lib/apod.ts toMedia()
 * cleared for the CSP gets here inline; everything else is a link out.
 */
export function ApodMediaView({ media, title }: { media: ApodMedia; title: string }) {
  if (media.kind === "image") {
    return (
      <a href={media.full} target="_blank" rel="noopener noreferrer" className="block border border-ink">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote NASA image; next/image would proxy every day's photo through our optimizer for no gain */}
        <img src={media.src} alt={title} className="block h-auto w-full" />
      </a>
    );
  }

  if (media.kind === "video") {
    return <video src={media.src} controls playsInline className="block aspect-video w-full border border-ink bg-ink" />;
  }

  if (media.kind === "embed") {
    return (
      <iframe
        src={media.src}
        title={title}
        className="block aspect-video w-full border border-ink bg-ink"
        allow="encrypted-media; fullscreen; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 border border-ink p-6">
      <p className="text-sm text-mute">Today&apos;s entry can&apos;t be shown here.</p>
      <a href={media.href} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
        Open on NASA
      </a>
    </div>
  );
}
