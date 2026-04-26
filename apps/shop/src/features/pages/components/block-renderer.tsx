import type { Block } from "@acme/convex/page-validators";

import { ContentBlockView } from "./content-block-view";
import { ImageBlockView } from "./image-block-view";

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:gap-14">
      {blocks.map((block) => {
        switch (block.type) {
          case "content":
            return <ContentBlockView key={block.id} body={block.data.body} />;
          case "image":
            if (block.data.status !== "ready") return null;
            return (
              <ImageBlockView
                key={block.id}
                downloadToken={block.data.downloadToken}
                fileName={block.data.fileName}
                alt={block.data.alt}
                widthScale={block.data.widthScale}
              />
            );
        }
      })}
    </div>
  );
}
