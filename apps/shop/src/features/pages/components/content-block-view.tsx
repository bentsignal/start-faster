import Markdown from "react-markdown";

export function ContentBlockView({ body }: { body: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert text-foreground/80 max-w-none leading-relaxed">
      <Markdown>{body}</Markdown>
    </div>
  );
}
