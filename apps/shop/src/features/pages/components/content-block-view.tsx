import Markdown from "react-markdown";

import { cn } from "@acme/ui/utils";

export function ContentBlockView({
  body,
  className,
}: {
  body: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert text-foreground/80 max-w-none leading-relaxed",
        "mx-auto max-w-3xl px-6 sm:px-8",
        className,
      )}
    >
      <Markdown>{body}</Markdown>
    </div>
  );
}
