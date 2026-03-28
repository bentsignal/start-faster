import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { hasCmsAccess } from "@acme/convex/privileges";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@acme/ui/sidebar";

import { AppSidebar } from "~/features/sidebars/components/app-sidebar";
import { userQueries } from "~/lib/user-queries";

export const Route = createFileRoute("/_authenticated/_authorized")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!hasCmsAccess(context.user)) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const { data: hasAccess } = useSuspenseQuery({
    ...userQueries.currentUser(),
    select: (data) => hasCmsAccess(data),
  });
  if (!hasAccess) {
    return <Navigate to="/" />;
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="relative">
          <SidebarTrigger className="absolute top-3 left-4 z-10" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
