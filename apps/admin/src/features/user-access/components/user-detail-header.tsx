import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";

import { useRevokeAllPermissions } from "~/features/user-access/hooks/use-update-user-access";
import { userAccessQueries } from "~/features/user-access/lib/user-access-queries";

export function UserDetailHeader() {
  const id = useParams({
    from: "/_authenticated/_authorized/users/$id",
    select: (params) => params.id,
  });

  const { data: targetUser } = useSuspenseQuery({
    ...userAccessQueries.userById(id),
    select: (data) => ({
      _id: data._id,
      name: data.name,
      email: data.email,
      adminLevel: data.adminLevel,
    }),
  });

  const { data: myAdminLevel } = useSuspenseQuery({
    ...convexQuery(api.users.getCurrentUser, {}),
    select: (data) => data.adminLevel,
  });

  const revokeAll = useRevokeAllPermissions();
  const canManage = myAdminLevel > targetUser.adminLevel;

  return (
    <div className="flex w-full items-start justify-between gap-6">
      <div>
        <p className="text-base font-medium">{targetUser.name}</p>
        <p className="text-muted-foreground mt-1 text-sm">{targetUser.email}</p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        disabled={!canManage}
        onClick={() => {
          revokeAll({ userId: targetUser._id }).catch(() => {
            toast.error("Failed to revoke permissions");
          });
        }}
      >
        Revoke All
      </Button>
    </div>
  );
}
