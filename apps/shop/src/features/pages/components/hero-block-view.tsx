import type { HeroId } from "@acme/convex/page-validators";
import { HERO_REGISTRY } from "@acme/features/heroes";

import { appUrls } from "~/urls";

export function HeroBlockView({ heroId }: { heroId: HeroId }) {
  const { component: Component } = HERO_REGISTRY[heroId];

  return <Component optimizerBaseUrl={appUrls.cms} />;
}
