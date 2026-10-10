import { ApodMediaView } from "@/components/apod/apod-media";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SectionLabel } from "@/components/ui/section-label";
import { Shell } from "@/components/ui/shell";
import { formatApodDate } from "@/lib/apod";
import { getPictureOfDay } from "@/lib/server/apod";

export default async function Home() {
  const result = await getPictureOfDay();

  if (!result.ok) {
    return (
      <>
        <SiteHeader />
        <Shell width="wide">
          <main className="flex flex-1 flex-col justify-center gap-6 py-10">
            <p className="label text-mute">Error</p>
            <h1 className="display text-5xl">The sky is cloudy.</h1>
            <p className="text-sm text-mute">Couldn&apos;t reach NASA right now. Please try again in a bit.</p>
          </main>
          <SiteFooter />
        </Shell>
      </>
    );
  }

  const { apod } = result;
  return (
    <>
      <SiteHeader right={<time dateTime={apod.date}>{formatApodDate(apod.date)}</time>} />
      <Shell width="wide">
        <main className="flex flex-1 flex-col gap-10 py-10">
          <section className="flex flex-col gap-4">
            <p className="label text-mute">Astronomy Picture of the Day</p>
            <h1 className="display text-4xl sm:text-5xl">{apod.title}</h1>
          </section>

          <section className="flex flex-col gap-3">
            <ApodMediaView media={apod.media} title={apod.title} />
            {apod.credit ? <p className="label text-mute">Credit: {apod.credit}</p> : null}
          </section>

          <section>
            <SectionLabel
              n="01"
              aside={
                <a href={apod.pageUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                  NASA page
                </a>
              }
            >
              Explanation
            </SectionLabel>
            <p className="text-sm leading-relaxed">{apod.explanation}</p>
          </section>
        </main>
        <SiteFooter />
      </Shell>
    </>
  );
}
