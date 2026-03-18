import { Loader } from "lucide-react";

import type { Id } from "@acme/convex/model";
import { NativeSelect, NativeSelectOption } from "@acme/ui/native-select";

import type { AccessLevel } from "~/features/user-access/lib/access-utils";
import { useUserSearchResults } from "~/features/user-access/hooks/use-user-search-results";
import { toAccessLevel } from "~/features/user-access/lib/access-utils";
import { useUpdateUserAccess } from "../hooks/use-update-user-access";

export function UserAccessList() {
  const { users, status, sentinelRef } = useUserSearchResults();

  const updateAccessLevel = useUpdateUserAccess();

  if (status === "LoadingFirstPage") {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
        <Loader className="size-4 animate-spin" />
        Loading users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No users found.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {users.map((user) => (
          <UserAccessRow
            key={user._id}
            userId={user._id}
            name={user.name}
            email={user.email}
            accessLevel={user.accessLevel}
            onAccessLevelChange={updateAccessLevel}
          />
        ))}
      </div>

      {status === "LoadingMore" && (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-sm">
          <Loader className="size-4 animate-spin" />
        </div>
      )}

      <div ref={sentinelRef} />
    </>
  );
}

export function UserAccessRow({
  userId,
  name,
  email,
  accessLevel,
  onAccessLevelChange,
}: {
  userId: Id<"users">;
  name: string;
  email: string;
  accessLevel: AccessLevel;
  onAccessLevelChange: (args: {
    userId: Id<"users">;
    accessLevel: AccessLevel;
  }) => void;
}) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-muted-foreground text-sm">{email}</p>
      </div>
      <NativeSelect
        value={accessLevel}
        className="w-full max-w-64"
        onChange={(event) => {
          onAccessLevelChange({
            userId,
            accessLevel: toAccessLevel(event.target.value),
          });
        }}
        aria-label={`Access level for ${email}`}
      >
        <NativeSelectOption value="unauthorized">
          unauthorized
        </NativeSelectOption>
        <NativeSelectOption value="authorized">authorized</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
