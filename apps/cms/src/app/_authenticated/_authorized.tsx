import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";
import { hasCmsAccess } from "@acme/convex/privileges";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@acme/ui/sidebar";

import { AppSidebar } from "~/features/sidebars/components/app-sidebar";

export const Route = createFileRoute("/_authenticated/_authorized")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!hasCmsAccess(context.user)) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.users.getCurrentUser, {}),
    );
  },
});

function RouteComponent() {
  const { data: hasAccess } = useSuspenseQuery({
    ...convexQuery(api.users.getCurrentUser, {}),
    select: (data) => hasCmsAccess(data),
  });
  if (!hasAccess) {
    return <Navigate to="/" />;
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center px-4">
          <SidebarTrigger />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
