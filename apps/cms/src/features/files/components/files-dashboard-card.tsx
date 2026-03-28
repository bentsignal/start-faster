import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Files } from "lucide-react";

import { hasCmsScopeOrAdmin } from "@acme/convex/privileges";
import { QuickLink } from "@acme/features/quick-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { userQueries } from "~/lib/user-queries";

export function FilesDashboardCard() {
  const { data: canUploadFiles } = useSuspenseQuery({
    ...userQueries.currentUser(),
    select: (data) => hasCmsScopeOrAdmin(data, "can-upload-files"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Files className="size-4" />
          Files
        </CardTitle>
        <CardDescription>
          Upload and browse shared CMS assets stored in Convex.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          {canUploadFiles
            ? "Your account can open the shared asset library and upload new files."
            : "Your account can enter the CMS, but it does not have permission to upload files yet."}
        </p>

        {canUploadFiles ? (
          <QuickLink
            to="/files"
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Open files
            <ArrowRight className="size-4" />
          </QuickLink>
        ) : null}
      </CardContent>
    </Card>
  );
}
