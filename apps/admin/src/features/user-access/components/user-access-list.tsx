import { Loader } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";

import { useUserSearchResults } from "~/features/user-access/hooks/use-user-search-results";

export function UserAccessList() {
  const { users, status, sentinelRef } = useUserSearchResults();

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
}: {
  userId: string;
  name: string;
  email: string;
}) {
  return (
    <QuickLink
      to="/users/$id"
      params={{ id: userId }}
      className="bg-card hover:bg-accent/40 block rounded-2xl border px-7 py-6 transition-colors"
    >
      <div>
        <p className="text-base font-medium">{name}</p>
        <p className="text-muted-foreground mt-1 text-sm">{email}</p>
      </div>
    </QuickLink>
  );
}
