import type { Infer } from "convex/values";
import { literals } from "convex-helpers/validators";
import { v } from "convex/values";

export const contentBlockValidator = v.object({
  type: v.literal("content"),
  id: v.string(),
  data: v.object({ body: v.string() }),
});
export type ContentBlock = Infer<typeof contentBlockValidator>;

export const imageBlockValidator = v.object({
  type: v.literal("image"),
  id: v.string(),
  data: v.union(
    v.object({ status: v.literal("empty") }),
    v.object({
      status: v.literal("ready"),
      fileId: v.id("files"),
      downloadToken: v.string(),
      fileName: v.string(),
      alt: v.string(),
      widthScale: v.number(),
    }),
  ),
});
export type ImageBlock = Infer<typeof imageBlockValidator>;

export const HEROES = ["launch-collection"] as const;
export const heroIdValidator = literals(...HEROES);
export type HeroId = (typeof HEROES)[number];

export const heroBlockValidator = v.object({
  type: v.literal("hero"),
  id: v.string(),
  data: v.object({ heroId: heroIdValidator }),
});
export type HeroBlock = Infer<typeof heroBlockValidator>;

export const productCarouselBlockValidator = v.object({
  type: v.literal("product-carousel"),
  id: v.string(),
  data: v.union(
    v.object({ status: v.literal("empty") }),
    v.object({
      status: v.literal("ready"),
      collectionHandle: v.string(),
      collectionTitle: v.string(),
    }),
  ),
});
export type ProductCarouselBlock = Infer<typeof productCarouselBlockValidator>;

export const blockValidator = v.union(
  contentBlockValidator,
  imageBlockValidator,
  heroBlockValidator,
  productCarouselBlockValidator,
);
export type Block = Infer<typeof blockValidator>;
