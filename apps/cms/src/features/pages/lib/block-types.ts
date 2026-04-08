import type { ComponentType } from "react";
import { FileText } from "lucide-react";

import type { Block } from "@acme/convex/page-validators";

export function createContentBlock() {
  return {
    type: "content",
    id: crypto.randomUUID(),
    data: { body: "" },
  } satisfies Block;
}

export const BLOCK_TYPE_LABELS = {
  content: "Content",
} as const satisfies Record<Block["type"], string>;

export const BLOCK_OPTIONS = [
  {
    type: "content",
    label: BLOCK_TYPE_LABELS.content,
    icon: FileText,
    create: createContentBlock,
  },
] satisfies readonly {
  type: Block["type"];
  label: string;
  icon: ComponentType<{ className?: string }>;
  create: () => Block;
}[];
