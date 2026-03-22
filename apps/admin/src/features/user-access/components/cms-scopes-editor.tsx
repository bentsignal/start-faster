import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";
import { CMS_SCOPES } from "@acme/convex/types";
import { toast } from "@acme/ui/toaster";

import { useUpdateCmsScopes } from "~/features/user-access/hooks/use-update-user-access";
import { userAccessQueries } from "~/features/user-access/lib/user-access-queries";

export function CmsScopesEditor() {
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

  const { data: currentUserAdminLevel } = useSuspenseQuery({
    ...convexQuery(api.users.getCurrentUser, {}),
    select: (data) => data.adminLevel,
  });

  const updateCmsScopes = useUpdateCmsScopes();
  const canManage = currentUserAdminLevel > user.adminLevel;

  return (
    <section className="flex flex-col gap-3">
      <span className="text-muted-foreground text-sm">CMS Permissions</span>
      <div className="flex flex-col gap-2">
        {CMS_SCOPES.map((scope) => (
          <label key={scope} className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              className="accent-primary size-4 rounded"
              checked={user.cmsScopes.includes(scope)}
              disabled={!canManage}
              onChange={(event) => {
                const next = event.target.checked
                  ? [...user.cmsScopes, scope]
                  : user.cmsScopes.filter((s) => s !== scope);
                updateCmsScopes({
                  userId: user._id,
                  cmsScopes: next,
                }).catch(() => {
                  toast.error("Failed to update CMS permissions");
                });
              }}
            />
            {scope}
          </label>
        ))}
      </div>
    </section>
  );
}
