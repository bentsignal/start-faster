import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";

import { getProductByHandle } from "~/lib/shopify/product.server";

export const Route = createFileRoute("/shop/$item")({
  component: RouteComponent,
  loader: async ({ params }) => {
    return getProductByHandle({
      data: {
        handle: params.item,
      },
    });
  },
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
  const { product } = Route.useLoaderData();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <p className="mb-1 text-2xl font-bold">Item: {item}</p>
      <p className="text-lg">Product title: {product?.title ?? "Not found"}</p>
      <p className="text-lg">
        Product handle: {product?.handle ?? "Not found"}
      </p>
      <p className="max-w-2xl text-center text-lg">
        Description: {product?.description ?? "No description"}
      </p>
      <p className="text-lg">
        Price:{" "}
        {product
          ? `${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`
          : "N/A"}
      </p>
      <p className="text-lg">Quantity: {quantity ? `${quantity}` : "N/A"}</p>
      <p className="text-lg">Size: {size ? `${size}` : "N/A"}</p>
      <p className="text-lg">Color: {color ? `${color}` : "N/A"}</p>
      <p className="text-lg">Sort: {sort ? `${sort}` : "N/A"}</p>
    </div>
  );
}
