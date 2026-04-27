// eslint-disable-next-line no-restricted-imports -- memo with fast deep equal to avoid re-rendering each block when siblings change
import { memo } from "react";
import fastDeepEqual from "fast-deep-equal";

import type { Block } from "@acme/convex/page-validators";

import { ContentBlockEditor } from "./content-block-editor";
import { HeroBlockEditor } from "./hero-block-editor";
import { ImageBlockEditor } from "./image-block-editor";

function BlockEditorComponent({
  block,
  onChange,
}: {
  block: Block;
  onChange: (block: Block) => void;
}) {
  switch (block.type) {
    case "content":
      return <ContentBlockEditor block={block} onChange={onChange} />;
    case "image":
      return <ImageBlockEditor block={block} onChange={onChange} />;
    case "hero":
      return <HeroBlockEditor block={block} onChange={onChange} />;
  }
}

export const BlockEditor = memo(
  BlockEditorComponent,
  (previousProps, nextProps) =>
    fastDeepEqual(previousProps.block, nextProps.block),
);
