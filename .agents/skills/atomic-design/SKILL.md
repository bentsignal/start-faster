---
name: atomic-design
description: Build UI using a modified Atomic Design system (atoms + molecules) with feature-first folders and composition. Use when creating or refactoring React/React Native components (Expo, Next.js), or when the user mentions atomic design, atoms, molecules, feature folders, barrels, or composition.
---

# Atomic Design (Modified)

## Core model

### Features

Keep code for a feature close together. Prefer placing UI, hooks, and stores under the feature directory so edits stay cohesive.

### Atoms

Atoms are the smallest reusable building blocks.

- Can contain any kind of code: components, store, hooks, types, constants.
- Multiple exports per file is encouraged.
- Can be built from other atoms.
- Must not depend on molecules.

### Molecules

Molecules compose atoms to solve a specific use-case.

- Tailored to a concrete widget/flow, possibly reusable.
- Typically one main component per file.
- Can be built from atoms and other molecules.

## Folder conventions (match this repo)

Inside a feature directory (example: `apps/expo/src/features/search/`):

```text
features/<feature>/
  atom/
    index.tsx
    <feature>-store.ts
    <feature>-components.tsx
  molecules/
    <use-case>.tsx
```

### `atom/index.tsx` is the atom boundary

- Export the atom’s public surface from `atom/index.tsx`.
- Prefer namespace imports from this barrel in molecules and screens.

## Composition rules

- Build molecules by importing the feature atom as a namespace: `import * as Feature from "../atom"`.
- If a feature needs scoped state/data, keep it in the atom store and pass it via `Feature.Store`.
- Atom components should read state via `useStore` selectors.
- Only promote something to a global atom (example: `~/atoms/button`) when it is genuinely cross-feature.

## Workflow

1. Decide the feature boundary where the change belongs.
2. Decide whether you are building:
   - an atom (reusable building block, used in multiple places), or
   - a molecule (a composed widget for a specific use-case).
3. If you need shared state across multiple atom components:
   - create or extend the feature store in `atom/<feature>-store.ts`
   - export `{ Store, useStore }` from the atom barrel
4. Put small reusable UI parts in `atom/<feature>-components.tsx` and export them from the barrel.
5. Compose molecules from the atom barrel; screens compose molecules and wrap the atom `Store` once.
6. Enforce one-way dependency flow: atoms → atoms, molecules → atoms/molecules, screens → everything below.

## Example pattern (Expo / React Native)

### Atom barrel

```tsx
export * from "./search-components";
export * from "./search-store";
```

### Atom store

```tsx
import { createStore } from "rostra";

import useDebouncedInput from "~/hooks/use-debounced-input";

function useInternalStore({ debounceTime = 500 }: { debounceTime?: number }) {
  const {
    value: searchTerm,
    setValue: setSearchTerm,
    debouncedValue: debouncedSearchTerm,
  } = useDebouncedInput(debounceTime);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
  };
}

export const { Store, useStore } = createStore(useInternalStore);
```

### Atom components (pull from store, expose small pieces)

```tsx
import type { ReactNode } from "react";
import type { PressableProps, TextInputProps } from "react-native";
import { Pressable, TextInput, View } from "react-native";

import { useStore } from "./search-store";

function Container({ children }: { children: ReactNode }) {
  return <View>{children}</View>;
}

function Input(props: TextInputProps) {
  const searchTerm = useStore((s) => s.searchTerm);
  const setSearchTerm = useStore((s) => s.setSearchTerm);
  return (
    <TextInput value={searchTerm} onChangeText={setSearchTerm} {...props} />
  );
}

function ClearButton(props: PressableProps) {
  const setSearchTerm = useStore((s) => s.setSearchTerm);
  const hideButton = useStore((s) => s.searchTerm.length === 0);
  if (hideButton) return null;
  return <Pressable onPress={() => setSearchTerm("")} {...props} />;
}

export { Container, Input, ClearButton };
```

### Molecule (compose atom via namespace import)

```tsx
import * as Search from "../atom";

function SearchBar() {
  return (
    <Search.Container>
      <Search.Input />
      <Search.ClearButton />
    </Search.Container>
  );
}

export { SearchBar };
```

### Screen boundary (wrap the atom `Store` once)

```tsx
import { View } from "react-native";

import * as Search from "~/features/search/atom";
import { SearchBar } from "~/features/search/molecules/search-bar";
import { SearchPageResults } from "~/features/search/molecules/search-page-results";

export default function SearchPage() {
  return (
    <Search.Store>
      <View className="flex-1">
        <SearchPageResults />
        <SearchBar />
      </View>
    </Search.Store>
  );
}
```

## Reference

- Article: `https://blog.bentsignal.com/organize-react-projects`
