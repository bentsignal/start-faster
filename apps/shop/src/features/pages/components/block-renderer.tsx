import type { Block } from "@acme/convex/page-validators";

import { ContentBlockView } from "./content-block-view";

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return blocks.map((block) => {
    /* eslint-disable @typescript-eslint/no-unnecessary-condition -- exhaustive switch for future block types, remove this disable comment when adding a second block type */
    switch (block.type) {
      case "content":
        return <ContentBlockView key={block.id} body={block.data.body} />;
    }
    /* eslint-enable @typescript-eslint/no-unnecessary-condition */
  });
}
