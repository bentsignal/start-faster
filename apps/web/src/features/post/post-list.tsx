import { useQuery } from "@tanstack/react-query";
import { useConvex } from "convex/react";

import { api } from "@acme/convex/api";

import * as Auth from "~/features/auth/atom";
import { Post } from "./post";

export const PostList = () => {
  const convex = useConvex();

  const imNotSignedIn = Auth.useStore((s) => s.imSignedOut);

  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => await convex.query(api.posts.getAll),
  });

  if (imNotSignedIn) {
    return <div>You must be signed in to view this page.</div>;
  }

  return (
    <div className="mx-auto mb-24 flex max-w-2xl flex-col gap-6 p-4">
      {posts?.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};
