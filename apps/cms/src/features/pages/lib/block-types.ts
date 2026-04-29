import type { ComponentType } from "react";
import { FileText, GalleryHorizontal, ImageIcon, Sparkles } from "lucide-react";

import type { Block } from "@acme/convex/page-validators";
import { HEROES } from "@acme/convex/page-validators";

export function createContentBlock() {
  return {
    type: "content",
    id: crypto.randomUUID(),
    data: { body: "" },
  } satisfies Block;
}

export function createImageBlock() {
  return {
    type: "image",
    id: crypto.randomUUID(),
    data: { status: "empty" },
  } satisfies Block;
}

export function createHeroBlock() {
  return {
    type: "hero",
    id: crypto.randomUUID(),
    data: { heroId: HEROES[0] },
  } satisfies Block;
}

export function createProductCarouselBlock() {
  return {
    type: "product-carousel",
    id: crypto.randomUUID(),
    data: { status: "empty" },
  } satisfies Block;
}

export const BLOCK_TYPE_LABELS = {
  content: "Content",
  image: "Image",
  hero: "Hero",
  "product-carousel": "Product Carousel",
} as const satisfies Record<Block["type"], string>;

export const BLOCK_OPTIONS = [
  {
    type: "content",
    label: BLOCK_TYPE_LABELS.content,
    icon: FileText,
    create: createContentBlock,
  },
  {
    type: "image",
    label: BLOCK_TYPE_LABELS.image,
    icon: ImageIcon,
    create: createImageBlock,
  },
  {
    type: "hero",
    label: BLOCK_TYPE_LABELS.hero,
    icon: Sparkles,
    create: createHeroBlock,
  },
  {
    type: "product-carousel",
    label: BLOCK_TYPE_LABELS["product-carousel"],
    icon: GalleryHorizontal,
    create: createProductCarouselBlock,
  },
] satisfies readonly {
  type: Block["type"];
  label: string;
  icon: ComponentType<{ className?: string }>;
  create: () => Block;
}[];
