---
name: state-management
description: Guides correct usage of the Rostra state management library (createStore, Store, useStore), including store scoping, selectors, optional access, prop-driven initialization, and typing. Use when dealing with state management in React/React Native, or when the user mentions rostra, createStore, useStore, Store providers, or performant state.
---

# State management

## Core rules (Rostra)

- `useInternalStore` is only used as an argument to `createStore`. Never call it directly from components.
- `useStore` is the only supported read/write access path for consumers.
- Wrap consumers in the matching `Store` provider. `useStore` throws if called outside its provider (unless `optional: true` is used).
- Keep stores as local as possible (feature-scoped) and only lift scope when multiple siblings need the state.

## Default workflow

1. Decide store scope
   - A single feature/subtree → create a local store and wrap that subtree.
   - Cross-cutting concerns (auth, theme) → create a higher-level store and wrap the app shell.
2. Implement the internal hook
   - Use React state/hooks inside the internal hook.
   - Return a plain object with state values and action functions.
3. Create the store
   - Call `createStore(useInternalStore)` and export its `Store` and `useStore`.
4. Consume with selectors
   - Select the smallest slice needed: `useStore(s => s.someValue)`.
   - Select actions separately: `useStore(s => s.someAction)`.
5. Add optional access only when necessary
   - Use `useStore(selector, { optional: true })` when the provider may not be present.

## Examples

### Minimal store

```tsx
import { useState } from "react";
import { createStore } from "rostra";

function useInternalStore() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((prev) => prev + 1);
  return { count, increment };
}

export const { Store, useStore } = createStore(useInternalStore);
```

```tsx
import { Store, useStore } from "./counter-store";

export function Counter() {
  return (
    <Store>
      <Value />
      <IncrementButton />
    </Store>
  );
}

function Value() {
  const count = useStore((s) => s.count);
  return <p>Count: {count}</p>;
}

function IncrementButton() {
  const increment = useStore((s) => s.increment);
  return <button onClick={increment}>Increment</button>;
}
```

### Store props (initialization)

```tsx
import { useState } from "react";
import { createStore } from "rostra";

type StoreProps = { initialCount: number };

function useInternalStore({ initialCount }: StoreProps) {
  const [count, setCount] = useState(initialCount);
  const increment = () => setCount((prev) => prev + 1);
  return { count, increment };
}

export const { Store, useStore } = createStore(useInternalStore);
```

```tsx
import { Store } from "./counter-store";

export function Counter() {
  return (
    <Store initialCount={10}>
      <div />
    </Store>
  );
}
```

### Strict typing (catch breaking changes early)

```tsx
import { useState } from "react";
import { createStore } from "rostra";

type StoreProps = { initialCount: number };
type StoreState = { count: number; increment: () => void };

function useInternalStore({ initialCount }: StoreProps): StoreState {
  const [count, setCount] = useState(initialCount);
  const increment = () => setCount((prev) => prev + 1);
  return { count, increment };
}

export const { Store, useStore } = createStore<StoreProps, StoreState>(
  useInternalStore,
);
```

### Optional access (provider may not exist)

```tsx
import { useStore } from "./counter-store";

export function MaybeCount() {
  const count = useStore((s) => s.count, { optional: true });
  if (count === undefined) return null;
  return <p>Count: {count}</p>;
}
```

## Notes

- Rostra’s re-render behavior guidance assumes the React Compiler is enabled; otherwise, memoize state/derived values inside `useInternalStore` as needed. See the upstream README for details: [bentsignal/rostra](https://github.com/bentsignal/rostra).
