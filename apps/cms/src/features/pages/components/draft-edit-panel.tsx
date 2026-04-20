import type { Block } from "@acme/convex/page-validators";

import { BlockList } from "~/features/pages/components/block-list";

export function DraftEditPanel({
  blocks,
  setBlocks,
}: {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto pt-4">
      <div className="mx-auto w-full max-w-3xl">
        <BlockList blocks={blocks} setBlocks={setBlocks} />
      </div>
    </div>
  );
}
