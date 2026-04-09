import type { DragEndEvent } from "@dnd-kit/core";
import { useEffect, useRef } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { Block } from "@acme/convex/page-validators";

import { AddBlockButton } from "./add-block-button";
import { BlockEditor } from "./block-editor";
import { BlockWrapper } from "./block-wrapper";

export function BlockList({
  blocks,
  setBlocks,
}: {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}) {
  const { sensors, handleDragEnd, handleAdd, handleUpdate, handleDelete } =
    useBlockList({ blocks, setBlocks });

  return (
    <div className="flex flex-col gap-1 p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block, index) => (
            <div key={block.id}>
              {index > 0 && (
                <AddBlockButton
                  variant="between"
                  onAdd={(b) => handleAdd(b, index)}
                />
              )}
              <BlockWrapper
                id={block.id}
                type={block.type}
                onDelete={() => handleDelete(block.id)}
              >
                <BlockEditor block={block} onChange={handleUpdate} />
              </BlockWrapper>
            </div>
          ))}
        </SortableContext>
      </DndContext>

      <div className={blocks.length > 0 ? "mt-3" : ""}>
        <AddBlockButton onAdd={(b) => handleAdd(b, blocks.length)} />
      </div>
    </div>
  );
}

function useBlockList({
  blocks,
  setBlocks,
}: {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}) {
  const blocksRef = useRef(blocks);
  // eslint-disable-next-line no-restricted-syntax -- syncs prop to ref so stable callbacks always read the latest blocks
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setBlocks(arrayMove(blocks, oldIndex, newIndex));
  }

  function handleAdd(block: Block, index: number) {
    const next = [...blocksRef.current];
    next.splice(index, 0, block);
    setBlocks(next);
  }

  function handleUpdate(updated: Block) {
    setBlocks(
      blocksRef.current.map((b) => (b.id === updated.id ? updated : b)),
    );
  }

  function handleDelete(id: string) {
    setBlocks(blocksRef.current.filter((b) => b.id !== id));
  }

  return { sensors, handleDragEnd, handleAdd, handleUpdate, handleDelete };
}
