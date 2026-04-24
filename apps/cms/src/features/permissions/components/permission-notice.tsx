import { Lock } from "lucide-react";

import type { CmsScope } from "@acme/convex/types";

import { getScopeDeniedMessage } from "~/features/permissions/lib/cms-scope-messages";

/**
 * Inline banner that sits at the top of a restricted section (e.g. page
 * settings form, draft editor). Use when the user can still see the
 * surrounding UI but some actions inside it are restricted.
 */
export function PermissionNoticeBanner({ scope }: { scope: CmsScope }) {
  return (
    <div className="bg-muted flex items-center gap-3 rounded-xl border px-4 py-3">
      <Lock className="text-muted-foreground size-4 shrink-0" />
      <div className="text-sm">
        <p className="font-medium">{getScopeDeniedMessage(scope)}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Ask an administrator if you need to be able to do this.
        </p>
      </div>
    </div>
  );
}

/**
 * Full-section empty state for routes the user reached but cannot view the
 * contents of at all (e.g. /pages without `can-view-pages`). Use when there
 * is no surrounding UI to keep — the whole page is the notice.
 */
export function PermissionNoticeBlocked({ scope }: { scope: CmsScope }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-20 text-center">
      <div className="bg-muted rounded-full p-3">
        <Lock className="text-muted-foreground size-6" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">Access required</h2>
      <p className="text-muted-foreground text-sm">
        {getScopeDeniedMessage(scope)}
      </p>
      <p className="text-muted-foreground text-xs">
        Ask an administrator if you need access.
      </p>
    </div>
  );
}
