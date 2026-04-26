import type { ComponentType } from "react";
import { FileText, ImageIcon } from "lucide-react";

import type { Block } from "@acme/convex/page-validators";

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

export const BLOCK_TYPE_LABELS = {
  content: "Content",
  image: "Image",
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
] satisfies readonly {
  type: Block["type"];
  label: string;
  icon: ComponentType<{ className?: string }>;
  create: () => Block;
}[];
