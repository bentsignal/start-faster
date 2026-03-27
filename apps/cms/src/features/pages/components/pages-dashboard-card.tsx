import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { ArrowRight, FileText } from "lucide-react";

import { api } from "@acme/convex/api";
import { hasCmsScopeOrAdmin } from "@acme/convex/privileges";
import { QuickLink } from "@acme/features/quick-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

export function PagesDashboardCard() {
  const { data: canManagePages } = useSuspenseQuery({
    ...convexQuery(api.users.getCurrentUser, {}),
    select: (data) => hasCmsScopeOrAdmin(data, "can-create-pages"),
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
