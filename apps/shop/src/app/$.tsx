import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { env } from "~/env";
import { shopQueries } from "~/lib/queries";

export const Route = createFileRoute("/$")({
  component: CmsPage,
  loader: async ({ context, params }) => {
    const path = `/${params._splat}`;
    const page = await context.queryClient.ensureQueryData(
      shopQueries.getByPath(path),
    );

    if (!page) {
      throw notFound();
    }

    return { page };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      meta: [
        { title: loaderData.page.title },
        {
          name: "og:title",
          content: loaderData.page.title,
        },
        {
          name: "og:url",
          content: `${env.VITE_SITE_URL}${loaderData.page.path}`,
        },
      ],
    };
  },
});

function CmsPage() {
  const { page: loaderPage } = Route.useLoaderData();
  const path = loaderPage.path;
  const { data: page } = useSuspenseQuery(shopQueries.getByPath(path));

  if (!page) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
      <p className="text-foreground/80 mt-6 leading-relaxed whitespace-pre-wrap">
        {page.content}
      </p>
    </main>
  );
}
