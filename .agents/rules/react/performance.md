# Performance

## Avoid unnecessary useEffect hooks

One of the most common anti-patterns in React code is reaching for `useEffect` when no external synchronization is happening. This is a big problem because it pushes business logic into React's lifecycle, which is a fragile place to fetch data, trigger mutations, or derive state.

For this reason, the only time you should use `useEffect` is to sync an external system with React state, as it was originally intended. Typically any other operation has a much better and safer implementation strategy.

If you think you have found a valid use case for `useEffect` that does not involve syncing with an external system, pause and confirm first with the user.

If you need further guidance on how to solve a problem without `useEffect`, you can find useful info on this page of the React docs: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

## React Compiler

This project has the React Compiler enabled. The compiler automatically memoizes values, functions, and components in many cases, so new code should default to relying on the compiler instead of reaching for `useMemo`, `useCallback`, or `memo` manually.

Manual memoization is still an escape hatch, not a banned API. Use it only when you need precise referential stability that other code depends on, such as a measured performance issue, an effect dependency that must stay stable, or a third-party API that keys off identity. If you add manual memoization, keep it narrow and leave a short comment explaining why the compiler is not enough there.

- No using `finally` in Try/Catch blocks

## Fine-grained selection

Many of the hooks used in this project accept a `select` option that narrows down which slice of data the component subscribes to. This is critical for performance because it means the component only re-renders when the selected slice changes, rather than when the entire underlying state object changes.

**Rule: Always select only the data you need. Never subscribe to an entire state object when you only use part of it.**

### TanStack Router — `useSearch`

```tsx
const q = useSearch({
  from: "/dashboard",
  select: (search) => search.q,
});
```

Without `select`, the component re-renders whenever _any_ search param on the route changes. With it, the component only re-renders when `q` changes.

### TanStack Query — `useSuspenseQuery`

```tsx
const { data: price } = useSuspenseQuery({
  ...productQueries.productByHandle(handle),
  select: (data) => data.product.price,
});
```

TanStack Query performs a referential equality check on the selected value. If the query refetches but `price` hasn't changed, the component won't re-render.

### Rostra — `useStore`

```tsx
const count = useStore((s) => s.count);
const increment = useStore((s) => s.increment);
```

Rostra compares the previous and next selected value. Selecting `count` separately from `increment` means a count change won't re-render the button that only uses `increment`, and vice versa. Never do `const store = useStore((s) => s)` — this defeats the entire purpose of Rostra's fine-grained subscription model.

## Minimizing re-renders

Beyond selectors, there are several structural patterns that keep re-renders tight.

### Push state down, not up

If only one part of a subtree needs a piece of state, own that state in the leaf component — not in a shared parent. Lifting state higher than necessary forces every child of the parent to re-render when the state changes.

### Split components at render boundaries

When a component mixes frequently-changing state with expensive-to-render UI, split them apart. The expensive portion stays static while the dynamic portion re-renders independently.

```tsx
function SearchPage() {
  return (
    <>
      <SearchInput />
      <ExpensiveResultsList />
    </>
  );
}

function SearchInput() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

Here `ExpensiveResultsList` does not re-render on every keystroke because the `query` state lives inside `SearchInput`, not in the shared parent.

### Compose with children

When a wrapper needs state but its children don't depend on it, pass children through as a prop. React skips re-rendering the `children` subtree because the reference hasn't changed.

```tsx
function ScrollTracker({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return <div data-scroll={scrollY}>{children}</div>;
}
```

`children` won't re-render when `scrollY` updates because `children` was created by the parent component, not by `ScrollTracker`.

### Avoid creating objects and arrays in JSX props when identity matters

Inline object/array literals create a new reference every render. That matters when the receiving component, hook, or library relies on referential equality. Hoist them to module scope or use a stable variable when values are truly static.

```tsx
// Bad — new array every render
function SortControls() {
  return (
    <SortSelect
      options={[
        { value: "relevance", label: "Featured" },
        { value: "price", label: "Price" },
      ]}
    />
  );
}

// Good — stable reference at module scope
const sortOptions = [
  { value: "relevance", label: "Featured" },
  { value: "price", label: "Price" },
];

function SortControls() {
  return <SortSelect options={sortOptions} />;
}
```
