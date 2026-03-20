import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { NativeSelect, NativeSelectOption } from "@acme/ui/native-select";
import { Separator } from "@acme/ui/separator";

import { useUpdateUserAccess } from "~/features/user-access/hooks/use-update-user-access";
import { toAccessLevel } from "~/features/user-access/lib/access-utils";
import { userAccessQueries } from "~/features/user-access/lib/user-access-queries";

export const Route = createFileRoute("/_authenticated/_authorized/users/$id")({
  component: UserDetailRoute,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      userAccessQueries.userById(params.id),
    );
  },
});

function UserDetailRoute() {
  const { id } = Route.useParams();
  const updateAccessLevel = useUpdateUserAccess();
  const { data: user } = useSuspenseQuery(userAccessQueries.userById(id));

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-10 sm:px-8">
        <div className="flex w-full justify-between gap-6">
          <div>
            <p className="text-base font-medium">{user.name}</p>
            <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
          </div>

          <div>
            <NativeSelect
              value={user.accessLevel}
              className="w-full max-w-64"
              onChange={(event) => {
                void updateAccessLevel({
                  userId: user._id,
                  accessLevel: toAccessLevel(event.target.value),
                });
              }}
              aria-label={`Access level for ${user.email}`}
            >
              <NativeSelectOption value="unauthorized">
                unauthorized
              </NativeSelectOption>
              <NativeSelectOption value="authorized">
                authorized
              </NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
        <Separator className="my-1 h-px max-w-xl" />
        <span className="text-muted-foreground text-sm">User Details</span>
      </div>
    </main>
  );
}
