import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";

export const Route = createFileRoute("/shop/$item")({
  component: RouteComponent,
  params: z.object({
    item: z.string(),
  }),
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
