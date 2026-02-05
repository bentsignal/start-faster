import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/create")({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/",
        search: { showLogin: true, redirectTo: "/create" },
      });
    }
  },
  component: CreatePage,
});

function CreatePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-foreground text-2xl font-bold">Create</h1>
    </div>
  );
}
