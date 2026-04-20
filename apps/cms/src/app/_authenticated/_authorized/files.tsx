import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasCmsScopeOrAdmin } from "@acme/convex/privileges";

import { FilesList } from "~/features/files/components/files-list";
import { FilesUploadCard } from "~/features/files/components/files-upload-card";
import { fileQueries } from "~/features/files/lib/file-queries";

export const Route = createFileRoute("/_authenticated/_authorized/files")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!hasCmsScopeOrAdmin(context.user, "can-upload-files")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(fileQueries.list());
  },
});

function RouteComponent() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-8">
      <FilesUploadCard />
      <FilesList />
    </div>
  );
}
