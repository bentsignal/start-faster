import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";

import { AdminLevelSelect } from "~/features/user-access/components/admin-level-select";
import { CmsScopesEditor } from "~/features/user-access/components/cms-scopes-editor";
import { UserDetailHeader } from "~/features/user-access/components/user-detail-header";
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
  const router = useRouter();
  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-10 sm:px-8">
        <Button
          onMouseDown={() => router.history.back()}
          variant="link"
          className="text-muted-foreground w-fit! px-0"
        >
          <ArrowLeft />
          Back to search
        </Button>
        <UserDetailHeader />

        <Separator className="my-1 h-px max-w-xl" />

        <AdminLevelSelect />

        <Separator className="my-1 h-px max-w-xl" />

        <CmsScopesEditor />
      </div>
    </main>
  );
}
