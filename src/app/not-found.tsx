import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Shell } from "@/components/ui/shell";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <Shell>
        <main className="flex flex-1 flex-col justify-center gap-6 py-10">
          <p className="label text-mute">404</p>
          <h1 className="display text-5xl">Nothing here.</h1>
          <p className="text-sm text-mute">This page doesn&apos;t exist.</p>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Back to today
          </Link>
        </main>
        <SiteFooter />
      </Shell>
    </>
  );
}
