import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import type { GetQueryVariables } from "@acme/shopify/storefront/generated";
import { getProductsByCollection } from "@acme/shopify/storefront/product";

import { shopify } from "~/lib/shopify";

const getProductsByCollectionFn = createServerFn({ method: "GET" })
  .inputValidator((value: GetQueryVariables) => value)
  .handler(async ({ data }) => {
    const response = await shopify.request(getProductsByCollection, {
      variables: data,
    });
    return response.data?.collection?.products;
  });

export const Route = createFileRoute("/")({
  loader: async () => {
    const data = await getProductsByCollectionFn({
      data: {
        handle: "frontpage",
        first: 24,
      },
    });
    return data?.nodes ?? [];
  },
  component: RouteComponent,
});

function RouteComponent() {
  const products = Route.useLoaderData();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-medium">Frontpage Collection</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                to="/shop/$item"
                params={{ item: product.handle }}
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
