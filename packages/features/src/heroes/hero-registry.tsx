import type { ComponentType } from "react";

import type { HEROES } from "@acme/convex/page-validators";

import { LaunchCollectionHero } from "./launch-collection-hero";

export const FALLBACK_IMAGE =
  "https://lcjw4hjenc.ufs.sh/f/dlAVwa1xZRzoPGPAVYMlRHnDjhbYXJ7ZpOdACLVk8KzfSW30";

export interface HeroProps {
  imageBaseUrl: string;
  optimizerBaseUrl?: string;
}

interface HeroDefinition {
  label: string;
  description: string;
  component: ComponentType<HeroProps>;
  image: string;
}

export type HeroId = (typeof HEROES)[number];

export const HERO_REGISTRY = {
  "launch-collection": {
    label: "Launch Collection",
    description: "For the first batch of products released to the site",
    component: LaunchCollectionHero,
    image: FALLBACK_IMAGE,
  },
} as const satisfies Record<HeroId, HeroDefinition>;
