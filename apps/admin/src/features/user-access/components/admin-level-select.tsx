import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { ADMIN_LEVELS } from "@acme/convex/types";
import { NativeSelect, NativeSelectOption } from "@acme/ui/native-select";
import { toast } from "@acme/ui/toaster";

import { useUpdateAdminLevel } from "~/features/user-access/hooks/use-update-user-access";
import {
  getAdminLevelLabel,
  isAdminLevel,
} from "~/features/user-access/lib/access-utils";
import { userAccessQueries } from "~/features/user-access/lib/user-access-queries";
import { adminQueries } from "~/lib/queries";

export function AdminLevelSelect() {
  const id = useParams({
    from: "/_authenticated/_authorized/users/$id",
    select: (params) => params.id,
  });

  const { data: user } = useSuspenseQuery({
    ...userAccessQueries.userById(id),
    select: (data) => ({
      _id: data._id,
      adminLevel: data.adminLevel,
      email: data.email,
    }),
  });

  const { data: currentUserAdminLevel } = useSuspenseQuery({
    ...adminQueries.currentUser(),
    select: (data) => data.adminLevel,
  });

  const updateAdminLevel = useUpdateAdminLevel();
  const canManage = currentUserAdminLevel > user.adminLevel;

  return (
    <section className="flex flex-col gap-3">
      <span className="text-muted-foreground text-sm">Admin Level</span>
      <NativeSelect
        value={String(user.adminLevel)}
        className="w-full max-w-64"
        disabled={!canManage}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (!isAdminLevel(parsed)) return;
          updateAdminLevel({
            userId: user._id,
            adminLevel: parsed,
          }).catch(() => {
            toast.error("Failed to update admin level");
          });
        }}
        aria-label={`Admin level for ${user.email}`}
      >
        {ADMIN_LEVELS.map((level) => (
          <NativeSelectOption
            key={level}
            value={String(level)}
            disabled={level >= currentUserAdminLevel}
          >
            {level} — {getAdminLevelLabel(level)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </section>
  );
}
