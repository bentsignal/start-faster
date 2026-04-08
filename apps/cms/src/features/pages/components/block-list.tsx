import type { DragEndEvent } from "@dnd-kit/core";
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
  onChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  const { sensors, handleDragEnd, handleAdd, handleUpdate, handleDelete } =
    useBlockList({ blocks, onChange });

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
  onChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
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

    onChange(arrayMove(blocks, oldIndex, newIndex));
  }

  function handleAdd(block: Block, index: number) {
    const next = [...blocks];
    next.splice(index, 0, block);
    onChange(next);
  }

  function handleUpdate(updated: Block) {
    onChange(blocks.map((b) => (b.id === updated.id ? updated : b)));
  }

  function handleDelete(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }

  return { sensors, handleDragEnd, handleAdd, handleUpdate, handleDelete };
}
