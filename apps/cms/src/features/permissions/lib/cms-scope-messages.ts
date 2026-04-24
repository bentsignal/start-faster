import type { CmsScope } from "@acme/convex/types";

const SCOPE_ACTIONS = {
  "can-view-pages": "view pages",
  "can-create-new-pages": "create new pages",
  "can-manage-page-content": "edit page content",
  "can-manage-page-metadata": "change page settings",
  "can-upload-files": "upload or manage files",
} satisfies Record<CmsScope, string>;

export function getScopeAction(scope: CmsScope) {
  return SCOPE_ACTIONS[scope];
}

export function getScopeDeniedMessage(scope: CmsScope) {
  return `You don't have access to ${SCOPE_ACTIONS[scope]}.`;
}
