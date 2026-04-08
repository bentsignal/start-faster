import type { ContentBlock } from "@acme/convex/page-validators";

export function ContentBlockEditor({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
}) {
  return (
    <textarea
      value={block.data.body}
      onChange={(e) =>
        onChange({ ...block, data: { ...block.data, body: e.target.value } })
      }
      placeholder="Start writing..."
      className="text-foreground placeholder:text-muted-foreground min-h-32 w-full resize-y border-0 bg-transparent p-4 text-sm leading-relaxed outline-none"
    />
  );
}
