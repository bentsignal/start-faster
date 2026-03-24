import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasCmsScopeOrAdmin } from "@acme/convex/privileges";

import { FilesHeader } from "~/features/files/components/files-header";
import { FilesList } from "~/features/files/components/files-list";
import { FilesUploadCard } from "~/features/files/components/files-upload-card";
import { filesQueries } from "~/features/files/lib/queries";

export const Route = createFileRoute("/_authenticated/_authorized/files")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!hasCmsScopeOrAdmin(context.user, "can-upload-files")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(filesQueries.list());
  },
});

function RouteComponent() {
  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-8">
        <FilesHeader />
        <FilesUploadCard />
        <FilesList />
      </div>
    </main>
  );
}
