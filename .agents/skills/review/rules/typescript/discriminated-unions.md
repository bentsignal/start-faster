# Discriminated Unions & Narrowing

## Intent

Real-world data comes in different shapes depending on context -- a response can succeed or fail, a component can be loading or loaded, a message can be text or an image. Discriminated unions model these variants explicitly so the compiler forces you to handle each case. This eliminates an entire class of bugs where code assumes the "happy path" and crashes on edge cases.

## Guidelines

- Use a shared literal field (the discriminant) to distinguish between variants. Common patterns: `type`, `status`, `kind`.
- Narrow using `if`/`switch` on the discriminant rather than checking for the existence of optional fields. Narrowing on the discriminant gives you full type safety inside each branch.
- Avoid modeling variants as a single type with a bunch of optional fields. This forces every consumer to handle impossible combinations and makes the code fragile.
- Prefer `switch` with exhaustiveness checking (via a `never` default) when there are three or more variants.

## Examples

### Good

```typescript
type Result =
  | { status: "success"; data: Order }
  | { status: "error"; error: string }

function handleResult(result: Result) {
  switch (result.status) {
    case "success":
      processOrder(result.data)
      break
    case "error":
      reportError(result.error)
      break
    default: {
      const _exhaustive: never = result
      throw new Error(`Unhandled status: ${_exhaustive}`)
    }
  }
}
```

Adding a new variant (e.g. `{ status: "pending" }`) will cause a compile error at the `never` assignment, forcing you to handle it.

### Bad

```typescript
type Result = {
  status: string
  data?: Order
  error?: string
}

function handleResult(result: Result) {
  if (result.data) {
    processOrder(result.data)
  }
  if (result.error) {
    reportError(result.error)
  }
}
```

`status` is a plain `string` so there's no narrowing. Both `data` and `error` are optional, so the compiler can't tell you which fields are actually available in each case. A new status like `"pending"` can be added silently without the compiler catching unhandled cases.
