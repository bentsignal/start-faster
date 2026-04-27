import type { HeroId } from "@acme/convex/page-validators";
import { HERO_REGISTRY } from "@acme/features/heroes";

import { env } from "~/env";

export function HeroBlockView({ heroId }: { heroId: HeroId }) {
  const { component: Component } = HERO_REGISTRY[heroId];

  return <Component optimizerBaseUrl={env.VITE_CMS_URL} />;
}
