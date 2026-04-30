import type { Id } from "@acme/convex/model";

import { PageVisibilityToggle } from "./page-visibility-toggle";

export function VisibilitySettings({ pageId }: { pageId: Id<"pages"> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Visibility</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Control whether this page is publicly accessible on the storefront.
        </p>
      </div>
      <PageVisibilityToggle pageId={pageId} />
    </div>
  );
}
