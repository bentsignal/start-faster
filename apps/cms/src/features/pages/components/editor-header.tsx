import type { VersionState } from "@acme/convex/types";

import { useActiveVersion } from "~/features/pages/hooks/use-active-version";

export function EditorHeader() {
  const activeVersion = useActiveVersion();
  if (!activeVersion) return null;

  const { title, description } = headerContent(activeVersion.state);

  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </header>
  );
}

function headerContent(state: VersionState) {
  switch (state) {
    case "draft":
      return {
        title: "Edit Draft",
        description:
          "Fill in your page details. Save as draft anytime, publish when ready.",
      };
    case "published":
      return {
        title: "Published Version",
        description:
          "This version has been published. Create a new draft to make changes.",
      };
    default: {
      const _exhaustive: never = state;
      throw new Error(`Unhandled state: ${String(_exhaustive)}`);
    }
  }
}
