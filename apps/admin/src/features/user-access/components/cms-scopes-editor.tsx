import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import type { CmsScope } from "@acme/convex/types";
import { CMS_SCOPES } from "@acme/convex/types";
import { toast } from "@acme/ui/toaster";

import { useUpdateCmsScopes } from "~/features/user-access/hooks/use-update-user-access";
import { canManageCmsScopes } from "~/features/user-access/lib/access-utils";
import { userAccessQueries } from "~/features/user-access/lib/user-access-queries";
import { adminQueries } from "~/lib/queries";

const SCOPE_LABELS = {
  "can-access-cms": "Can access the CMS",
  "can-create-new-pages": "Can create new pages",
  "can-manage-page-content":
    "Can create and upload new drafts to existing pages",
  "can-manage-page-metadata": "Can change page metadata like title and URL",
  "can-upload-files": "Can upload files to the shared asset library",
} as const satisfies Record<CmsScope, string>;

function useScopes() {
  const id = useParams({
    from: "/_authenticated/_authorized/users/$id",
    select: (params) => params.id,
  });

  const { data: user } = useSuspenseQuery({
    ...userAccessQueries.userById(id),
    select: (data) => ({
      _id: data._id,
      adminLevel: data.adminLevel,
      cmsScopes: data.cmsScopes,
    }),
  });

  const { data: currentUser } = useSuspenseQuery({
    ...adminQueries.currentUser(),
    select: (data) => ({ _id: data._id, adminLevel: data.adminLevel }),
  });

  const updateCmsScopes = useUpdateCmsScopes();
  const canManage = canManageCmsScopes({
    currentUserId: currentUser._id,
    currentUserAdminLevel: currentUser.adminLevel,
    targetUserId: user._id,
    targetUserAdminLevel: user.adminLevel,
  });

  return {
    user,
    updateCmsScopes,
    canManage,
  };
}

function ScopeCheckbox({
  scope,
  checked,
  disabled,
  onChange,
}: {
  scope: CmsScope;
  checked: boolean;
  disabled: boolean;
  onChange: (scope: CmsScope, checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        className="accent-primary size-4 rounded"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(scope, event.target.checked)}
      />
      {SCOPE_LABELS[scope]}
    </label>
  );
}

export function CmsScopesEditor() {
  const { user, updateCmsScopes, canManage } = useScopes();

  function handleChange(scope: CmsScope, checked: boolean) {
    const next = checked
      ? [...user.cmsScopes, scope]
      : user.cmsScopes.filter((s) => s !== scope);
    updateCmsScopes({ userId: user._id, cmsScopes: next }).catch(() => {
      toast.error("Failed to update permissions");
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <span className="text-muted-foreground text-sm">CMS</span>
      <div className="border-border flex flex-col gap-3 rounded-lg border px-4 py-3">
        <ScopeCheckbox
          scope="can-access-cms"
          checked={user.cmsScopes.includes("can-access-cms")}
          disabled={!canManage}
          onChange={handleChange}
        />

        <span className="text-muted-foreground text-xs">Permissions</span>
        <div className="flex flex-col gap-2">
          {CMS_SCOPES.filter((s) => s !== "can-access-cms").map((scope) => (
            <ScopeCheckbox
              key={scope}
              scope={scope}
              checked={user.cmsScopes.includes(scope)}
              disabled={!canManage}
              onChange={handleChange}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
