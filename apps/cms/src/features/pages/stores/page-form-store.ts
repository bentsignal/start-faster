import { useState } from "react";
import { createStore } from "rostra";

import type { PageFields } from "~/features/pages/lib/types";

function useInternalStore({ initial }: { initial: PageFields }) {
  const [title, setTitle] = useState(initial.title);
  const [path, setPath] = useState(initial.path);
  const [content, setContent] = useState(initial.content);

  return { title, path, content, setTitle, setPath, setContent };
}

export const { Store: PageFormStore, useStore: usePageFormStore } =
  createStore(useInternalStore);
