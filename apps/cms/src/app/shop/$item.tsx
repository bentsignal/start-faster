import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";

export const Route = createFileRoute("/shop/$item")({
  component: RouteComponent,
  params: z.object({
    item: z.string(),
  }),
  validateSearch: z.object({
    quantity: z.number().optional(),
    size: z.enum(["small", "medium", "large"]).optional(),
    color: z.enum(["red", "blue", "green"]).optional(),
    sort: z.enum(["price", "name"]).optional(),
  }),
});

function RouteComponent() {
  const { item } = Route.useParams();
  const { quantity, size, color, sort } = Route.useSearch();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <p className="mb-1 text-2xl font-bold">Item: {item}</p>
      <p className="text-lg">Quantity: {quantity ? `${quantity}` : "N/A"}</p>
      <p className="text-lg">Size: {size ? `${size}` : "N/A"}</p>
      <p className="text-lg">Color: {color ? `${color}` : "N/A"}</p>
      <p className="text-lg">Sort: {sort ? `${sort}` : "N/A"}</p>
    </div>
  );
}
