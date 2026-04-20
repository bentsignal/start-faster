export interface PageTreeNode<T extends { path: string }> {
  page: T;
  children: PageTreeNode<T>[];
}

/**
 * Builds a tree of pages by path hierarchy. A page is a child of another page
 * when its path starts with that page's path followed by "/". Pages whose path
 * has no existing ancestor page land at the root.
 */
export function buildPageTree<T extends { path: string }>(pages: readonly T[]) {
  const sorted = [...pages].sort((a, b) => a.path.localeCompare(b.path));
  const roots = new Array<PageTreeNode<T>>();
  const stack = new Array<PageTreeNode<T>>();

  for (const page of sorted) {
    const node = { page, children: new Array<PageTreeNode<T>>() };

    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      if (!top) break;
      const prefix =
        top.page.path === "/" ? "/" : `${top.page.path.replace(/\/$/, "")}/`;
      if (page.path !== top.page.path && page.path.startsWith(prefix)) {
        top.children.push(node);
        stack.push(node);
        break;
      }
      stack.pop();
    }

    if (stack[stack.length - 1] !== node) {
      roots.push(node);
      stack.push(node);
    }
  }

  return roots;
}
