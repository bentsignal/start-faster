import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
