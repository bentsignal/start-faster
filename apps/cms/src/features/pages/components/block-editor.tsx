// eslint-disable-next-line no-restricted-imports -- memo with fast deep equal to avoid re-rendering each block when siblings change
import { memo } from "react";
import fastDeepEqual from "fast-deep-equal";

import type { Block } from "@acme/convex/page-validators";

import { ContentBlockEditor } from "./content-block-editor";

function BlockEditorComponent({
  block,
  onChange,
}: {
  block: Block;
  onChange: (block: Block) => void;
}) {
  /* eslint-disable @typescript-eslint/no-unnecessary-condition -- exhaustive switch for future block types */
  switch (block.type) {
    case "content":
      return <ContentBlockEditor block={block} onChange={onChange} />;
  }
  /* eslint-enable @typescript-eslint/no-unnecessary-condition */
}

export const BlockEditor = memo(
  BlockEditorComponent,
  (previousProps, nextProps) =>
    fastDeepEqual(previousProps.block, nextProps.block),
);
