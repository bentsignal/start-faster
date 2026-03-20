# Const Assertions

## Intent

By default, TypeScript widens literal values to their base types. `"admin"` becomes `string`, `42` becomes `number`, and array literals widen to mutable arrays with widened element types. This is usually too loose. `as const` tells the compiler to preserve the exact literal types and make everything `readonly`. This is critical for discriminated unions, configuration objects, and anywhere you want the compiler to know the _exact_ values, not just the general shape.

## Guidelines

- Use `as const` on configuration objects, lookup maps, and any data that defines a fixed set of values.
- Use `as const` on arrays that represent a known set of options (e.g. for deriving union types).
- Prefer `as const` over manually writing literal union types when the source of truth is an array or object.
- `as const` is the one acceptable use of `as` since it tightens types rather than loosening them.

## Examples

### Deriving union types from a single source of truth

```typescript
const STATUS = ["idle", "loading", "success", "error"] as const;
type Status = (typeof STATUS)[number];

function renderIcon(status: Status) {
  switch (status) {
    case "idle":
      return "pause";
    case "loading":
      return "spinner";
    case "success":
      return "check";
    case "error":
      return "alert";
    default: {
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
    }
  }
}
```

Without `as const`, `STATUS` is typed as `string[]` and there's no way to derive the `Status` union from it. With it, the array _is_ the source of truth -- adding `"retrying"` to the array automatically updates the union, and TypeScript will immediately flag the `switch` as non-exhaustive until you handle the new case. No separate type declaration to keep in sync.

### Exhaustive lookup maps with `satisfies` + `as const`

```typescript
type Category = "projects" | "storage";

const PLAN_LIMITS = {
  free: { projects: 3, storage: 500 },
  pro: { projects: 50, storage: 10_000 },
  enterprise: { projects: Infinity, storage: Infinity },
} as const satisfies Record<string, Record<Category, number>>;

type Plan = keyof typeof PLAN_LIMITS;

function getLimit(plan: Plan, category: Category) {
  return PLAN_LIMITS[plan][category];
}
```

`Category` is defined explicitly because it serves as the **constraint** -- `satisfies` uses it to guarantee every plan entry has all the required category keys, so a typo like `stroage` or a missing key is caught immediately. Deriving `Category` from the object would defeat this: if an entry were missing a key, TypeScript would silently narrow the derived type instead of flagging an error. `Plan`, on the other hand, is the dimension most likely to grow, so it's **derived** from the object -- adding a new plan is a one-line change with no separate type to update. `as const` preserves the exact literal types so `Plan` resolves to `"free" | "pro" | "enterprise"` and numeric values stay as `3`, `500`, etc. instead of widening to `number`.

### Bad

```typescript
type Status = "idle" | "loading" | "success" | "error";
const STATUS = ["idle", "loading", "success", "error"];

type Category = "projects" | "storage";
type Plan = "free" | "pro" | "enterprise";
const PLAN_LIMITS: Record<Plan, Record<Category, number>> = {
  free: { projects: 3, storage: 500 },
  pro: { projects: 50, storage: 10_000 },
  enterprise: { projects: Infinity, storage: Infinity },
};
```

Each of these has two sources of truth that must be kept in sync manually. The `Record` annotation widens all values to `number`, so the compiler can't distinguish `3` from `Infinity`. The `STATUS` array is just `string[]` at the type level, useless for deriving anything. Every new addition requires updating code in multiple places -- a guaranteed source of drift.
