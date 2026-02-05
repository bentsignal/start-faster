import { Image } from "@unpic/react";
import { Bookmark, Heart, MessageCircle, Share } from "lucide-react";

import type { UIPost } from "@acme/convex/types";

import * as Profile from "~/features/profile/atom";

export const Post = ({ post }: { post: UIPost }) => {
  return (
    <article className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4">
      <Profile.Store profile={post.creator}>
        <div className="flex items-center gap-3">
          <Profile.PFP variant="sm" />
          <div className="flex flex-col">
            <Profile.Name className="text-sm font-bold" />
            <Profile.Username className="text-muted-foreground text-xs font-semibold" />
          </div>
          <span className="text-muted-foreground ml-auto text-xs">
            {new Date(post._creationTime).toLocaleDateString()}
          </span>
        </div>
      </Profile.Store>

      {post.images.length > 0 && post.images[0] && (
        <div className="bg-muted relative w-full overflow-hidden rounded-lg">
          <Image
            src={post.images[0].url}
            alt={post.images[0].alt ?? post.caption ?? ""}
            width={800}
            height={600}
            layout="constrained"
            className="object-cover"
          />
        </div>
      )}

      {post.caption && (
        <p className="text-sm leading-relaxed">{post.caption}</p>
      )}

      <div className="flex items-center gap-6">
        <button className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2">
          <Heart className="h-5 w-5" />
        </button>
        <button className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2">
          <MessageCircle className="h-5 w-5" />
        </button>
        <button className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2">
          <Bookmark className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        <button className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2">
          <Share className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
};
