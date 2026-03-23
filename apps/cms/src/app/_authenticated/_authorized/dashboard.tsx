import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_authorized/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="bg-background min-h-screen">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <h1 className="text-2xl font-semibold">CMS Dashboard</h1>
      </div>
    </main>
  );
}
