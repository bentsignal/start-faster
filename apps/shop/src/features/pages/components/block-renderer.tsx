import type { Block } from "@acme/convex/page-validators";
import { cn } from "@acme/ui/utils";

import { ContentBlockView } from "./content-block-view";
import { HeroBlockView } from "./hero-block-view";
import { ImageBlockView } from "./image-block-view";

const TOP_SPACING = "pt-6 sm:pt-8 lg:pt-14";
const BOTTOM_SPACING = "pb-6 sm:pb-8 lg:pb-14";
const GAP = "gap-6 sm:gap-8 lg:gap-14";

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:gap-8 lg:gap-14",
        GAP,
        BOTTOM_SPACING,
      )}
    >
      {blocks.map((block, index) => {
        switch (block.type) {
          case "content":
            return (
              <ContentBlockView
                key={block.id}
                body={block.data.body}
                className={index === 0 ? TOP_SPACING : undefined}
              />
            );
          case "image":
            if (block.data.status !== "ready") return null;
            return (
              <ImageBlockView
                key={block.id}
                downloadToken={block.data.downloadToken}
                fileName={block.data.fileName}
                alt={block.data.alt}
                widthScale={block.data.widthScale}
                className={index === 0 ? TOP_SPACING : undefined}
              />
            );
          case "hero":
            return <HeroBlockView key={block.id} heroId={block.data.heroId} />;
        }
      })}
    </div>
  );
}
