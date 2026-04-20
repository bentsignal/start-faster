import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";

import type { PageTreeNode } from "~/features/pages/lib/build-page-tree";
import { PageListRow } from "~/features/pages/components/page-list-row";
import { buildPageTree } from "~/features/pages/lib/build-page-tree";
import { pageQueries } from "~/features/pages/lib/page-queries";

const pagesRoute = getRouteApi("/_authenticated/_authorized/pages/");

interface TreeRow {
  _id: Id<"pages">;
  title: string;
  path: string;
  hasRelease: boolean;
  hasDraft: boolean;
}

function matchesSearch(page: TreeRow, term: string) {
  if (!term) return true;
  const needle = term.toLowerCase();
  return (
    page.title.toLowerCase().includes(needle) ||
    page.path.toLowerCase().includes(needle)
  );
}

function pruneTree(nodes: PageTreeNode<TreeRow>[], term: string) {
  if (!term) return nodes;
  const result = new Array<PageTreeNode<TreeRow>>();
  for (const node of nodes) {
    const children = pruneTree(node.children, term);
    if (matchesSearch(node.page, term) || children.length > 0) {
      result.push({ page: node.page, children });
    }
  }
  return result;
}

function usePageTree() {
  const searchTerm = pagesRoute.useSearch({ select: (s) => s.q });

  const { data } = useSuspenseQuery({
    ...pageQueries.list(),
    select: (pages) =>
      pages.map((p) => ({
        _id: p._id,
        title: p.title,
        path: p.path,
        hasRelease: p.hasRelease,
        hasDraft: p.hasDraft,
      })),
  });

  return { tree: pruneTree(buildPageTree(data), searchTerm), searchTerm };
}

export function PagesTreeView() {
  const { tree, searchTerm } = usePageTree();

  if (tree.length === 0) {
    return (
      <div className="text-muted-foreground px-1 py-8 text-sm">
        {searchTerm ? "No pages match your search." : "No pages yet."}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {tree.map((node) => (
        <TreeNode key={node.page._id} node={node} nested={false} />
      ))}
    </ul>
  );
}

const CONNECTOR =
  // Continuous vertical line: runs the full height of the li, overshooting into
  // the gap above and below so it connects with adjacent siblings' lines.
  "before:content-[''] before:absolute before:-left-5 before:-top-[3px] before:-bottom-[3px] before:w-px before:bg-border " +
  // Horizontal branch at the row's vertical midline.
  "after:content-[''] after:absolute after:-left-5 after:top-[30px] after:w-5 after:h-px after:bg-border " +
  // Last child: replace the straight vertical + branch with a rounded elbow.
  "[&:last-child]:before:bottom-auto [&:last-child]:before:h-[33px] [&:last-child]:before:w-5 [&:last-child]:before:bg-transparent [&:last-child]:before:border-l [&:last-child]:before:border-b [&:last-child]:before:border-border [&:last-child]:before:rounded-bl-xl " +
  "[&:last-child]:after:hidden";

function TreeNode({
  node,
  nested,
}: {
  node: PageTreeNode<TreeRow>;
  nested: boolean;
}) {
  return (
    <li className={nested ? `relative ${CONNECTOR}` : "relative"}>
      <PageListRow page={node.page} />
      {node.children.length > 0 ? (
        <ul className="mt-1.5 flex flex-col gap-1.5 pl-6">
          {node.children.map((child) => (
            <TreeNode key={child.page._id} node={child} nested={true} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
