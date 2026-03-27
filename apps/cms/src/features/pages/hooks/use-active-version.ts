import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext, useSearch } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

export function useActiveVersion() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const versionId = useSearch({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (s) => s.versionId,
  });

  const { data } = useSuspenseQuery({
    ...convexQuery(api.pages.getById, { pageId }),
    select: (data) => {
      const selected = versionId
        ? data.versions.find((v) => v._id === versionId)
        : undefined;
      const latestDraft = data.versions.find((v) => v.state === "draft");
      const version = selected ?? latestDraft ?? data.versions[0];
      if (!version) return null;
      return {
        versionId: version._id,
        state: version.state,
        title: version.title ?? "",
        path: version.path ?? "",
        content: version.content ?? "",
      };
    },
  });

  return data;
}
