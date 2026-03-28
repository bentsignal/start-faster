import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, FileText } from "lucide-react";

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

export function PagesDashboardCard() {
  const { data: canManagePages } = useSuspenseQuery({
    ...userQueries.currentUser(),
    select: (data) => hasCmsScopeOrAdmin(data, "can-view-pages"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-4" />
          Pages
        </CardTitle>
        <CardDescription>
          Create and manage pages published on the shop.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          {canManagePages
            ? "Your account can create and manage pages on the shop."
            : "Your account can enter the CMS, but it does not have permission to manage pages yet."}
        </p>

        {canManagePages ? (
          <QuickLink
            to="/pages"
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Open pages
            <ArrowRight className="size-4" />
          </QuickLink>
        ) : null}
      </CardContent>
    </Card>
  );
}
