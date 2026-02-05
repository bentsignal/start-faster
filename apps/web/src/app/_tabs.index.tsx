import { createFileRoute } from "@tanstack/react-router";

import { PostList } from "~/features/post/post-list";

export const Route = createFileRoute("/_tabs/")({
  component: HomePage,
});

function HomePage() {
  return <PostList />;
}
