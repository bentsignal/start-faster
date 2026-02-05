import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/notifications")({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/",
        search: { showLogin: true, redirectTo: "/notifications" },
      });
    }
  },
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-foreground text-2xl font-bold">Notifications</h1>
    </div>
  );
}
