import type { Infer } from "convex/values";
import { v } from "convex/values";

export const contentBlockValidator = v.object({
  type: v.literal("content"),
  id: v.string(),
  data: v.object({ body: v.string() }),
});
export type ContentBlock = Infer<typeof contentBlockValidator>;

export const blockValidator = v.union(contentBlockValidator);
export type Block = Infer<typeof blockValidator>;
