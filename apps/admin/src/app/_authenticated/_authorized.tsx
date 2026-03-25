import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { MIN_ADMIN_LEVEL } from "@acme/convex/types";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@acme/ui/sidebar";

import { AppSidebar } from "~/features/layout/components/app-sidebar";
import { adminQueries } from "~/lib/queries";

export const Route = createFileRoute("/_authenticated/_authorized")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.user.adminLevel < MIN_ADMIN_LEVEL) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const { data: adminLevel } = useSuspenseQuery({
    ...adminQueries.currentUser(),
    select: (data) => data.adminLevel,
  });
  if (adminLevel < MIN_ADMIN_LEVEL) {
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
