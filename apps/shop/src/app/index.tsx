import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import type { GetQueryVariables } from "@acme/shopify/storefront/generated";

import { Link } from "~/components/link";
import { productQueries } from "~/features/product/lib/product-queries";

const args = {
  handle: "frontpage",
  first: 24,
} as const satisfies GetQueryVariables;

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      productQueries.productsFromCollection(args),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: products } = useSuspenseQuery(
    productQueries.productsFromCollection(args),
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-medium">Frontpage Collection</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                to="/shop/$handle"
                params={{ handle: product.handle }}
                className="hover:bg-muted rounded-lg border p-4 transition-colors"
              >
                <p className="font-medium">{product.title}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {product.priceRange.minVariantPrice.amount}{" "}
                  {product.priceRange.minVariantPrice.currencyCode}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No products found in the frontpage collection.
          </p>
        )}
      </section>
    </div>
  );
}
