import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shop/$item")({
  component: RouteComponent,
});

function RouteComponent() {
  const { item } = Route.useParams();
  return (
    <div>
      <h1>Shop</h1>
      <p>Item: {item}</p>
    </div>
  );
}
