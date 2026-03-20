# Avoid Type Assertions

## Intent

Type assertions (`as X`) tell the compiler "I know better than you." This is almost always wrong. When you assert, you're opting out of type checking for that expression -- you lose the compiler's protection and introduce a potential runtime crash that TypeScript was designed to prevent. The type system exists to catch mistakes; assertions bypass it.

## Guidelines

- Never use `as` to silence a type error. If the types don't line up, fix the underlying data flow rather than overriding the compiler.
- Never use `any` as an escape hatch. `unknown` is fine at trust boundaries, but it must be narrowed or validated before use. If you genuinely don't know the shape of some data (e.g. parsing external input), validate it at the boundary with a runtime check or a schema validation library like Zod, and let the validated result flow through with full inference.
- The only acceptable use of `as` is `as const` (which _tightens_ the type rather than loosening it).
- If a third-party library has incorrect types, wrap it in a thin adapter with proper types rather than sprinkling assertions throughout the codebase.

## Examples

### Good

```typescript
import { z } from "zod"

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["admin", "member"]),
})

function parseUser(raw: unknown) {
  return UserSchema.parse(raw)
}
```

The return type is fully inferred from the Zod schema. If the shape changes, you update one place and the compiler propagates it everywhere.

### Bad

```typescript
function parseUser(raw: unknown) {
  const data = raw as { id: string; name: string; role: string }
  return data
}
```

If `raw` is missing `id` or has a different shape, this silently passes at compile time and explodes at runtime. The assertion gives a false sense of safety.

### Good

```typescript
function getElement(id: string) {
  const el = document.getElementById(id)
  if (!el) throw new Error(`Element #${id} not found`)
  return el
}
```

After the null check, `el` is narrowed to `HTMLElement` without any assertion.

### Bad

```typescript
function getElement(id: string) {
  return document.getElementById(id) as HTMLElement
}
```

If the element doesn't exist, this returns `null` typed as `HTMLElement` -- a lie that causes a runtime crash later.
