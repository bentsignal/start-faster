import { Image } from "@unpic/react";

import { Button } from "@acme/ui/button";

import { Link } from "~/components/link";

export function Hero() {
  return (
    <section className="grid w-full grid-cols-1 xl:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
      <div className="w-full">
        <Image
          src="https://lcjw4hjenc.ufs.sh/f/dlAVwa1xZRzoPGPAVYMlRHnDjhbYXJ7ZpOdACLVk8KzfSW30"
          alt="Lifestyle photos from the launch collection"
          width={1440}
          height={720}
          fetchPriority="high"
          loading="eager"
          className="block h-auto w-full"
        />
      </div>

      <div className="bg-primary flex flex-col items-start justify-center gap-8 px-8 py-14 sm:px-12 sm:py-16 xl:gap-6 xl:px-12 xl:py-8 2xl:gap-8 2xl:px-16 2xl:py-12">
        <div className="flex flex-col gap-4">
          <span className="text-primary-foreground/60 font-mono text-[10px] tracking-[0.2em] uppercase">
            New Arrival
          </span>
          <h1 className="text-primary-foreground text-3xl leading-tight font-semibold tracking-tight sm:text-4xl xl:text-[clamp(2.15rem,2.25vw,2.8rem)] xl:leading-[1.1]">
            Check out the launch collection
          </h1>
          <p className="text-primary-foreground/70 max-w-sm text-sm leading-relaxed sm:text-base xl:text-[0.95rem]">
            We're live, check out the first batch of cool stuff.
          </p>
        </div>

        <Button
          size="lg"
          variant="secondary"
          className="rounded-full px-8 text-sm font-medium tracking-wide uppercase"
          render={(props) => (
            <Link
              to="/collections/$handle"
              params={{ handle: "launch" }}
              {...props}
            >
              Shop Now
            </Link>
          )}
        />
      </div>
    </section>
  );
}
