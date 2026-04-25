import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";

import { useRevokeAllPermissions } from "~/features/user-access/hooks/use-update-user-access";
import {
  canManageAdminLevel,
  canManageCmsScopes,
} from "~/features/user-access/lib/access-utils";
import { userAccessQueries } from "~/features/user-access/lib/user-access-queries";
import { adminQueries } from "~/lib/queries";

function useHeader() {
  const idFromParams = useParams({
    from: "/_authenticated/_authorized/users/$id",
    select: (params) => params.id,
  });

  const { data: targetUser } = useSuspenseQuery({
    ...userAccessQueries.userById(idFromParams),
    select: (data) => ({
      _id: data._id,
      name: data.name,
      email: data.email,
      adminLevel: data.adminLevel,
    }),
  });

  const { data: currentUser } = useSuspenseQuery({
    ...adminQueries.currentUser(),
    select: (data) => ({ _id: data._id, adminLevel: data.adminLevel }),
  });

  const revokeAll = useRevokeAllPermissions();
  // Revoking an admin demotes them, which requires super admin. Revoking a
  // non-admin only clears scopes, which basic admins can also do.
  const canManage =
    targetUser.adminLevel === 0
      ? canManageCmsScopes({
          currentUserId: currentUser._id,
          currentUserAdminLevel: currentUser.adminLevel,
          targetUserId: targetUser._id,
          targetUserAdminLevel: targetUser.adminLevel,
        })
      : canManageAdminLevel({
          currentUserId: currentUser._id,
          currentUserAdminLevel: currentUser.adminLevel,
          targetUserId: targetUser._id,
        });
  const { name, email, _id: id } = targetUser;

  return { name, email, id, canManage, revokeAll };
}

export function UserDetailHeader() {
  const { name, email, id, canManage, revokeAll } = useHeader();

  return (
    <div className="flex w-full items-start justify-between gap-6">
      <div>
        <p className="text-base font-medium">{name}</p>
        <p className="text-muted-foreground mt-1 text-sm">{email}</p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        disabled={!canManage}
        onClick={() => {
          revokeAll({ userId: id }).catch(() => {
            toast.error("Failed to revoke permissions");
          });
        }}
      >
        Revoke All
      </Button>
    </div>
  );
}
