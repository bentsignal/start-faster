---
name: typescript
description: TypeScript coding standards for this project. Use when writing or modifying TypeScript files.
---

# TypeScript

These are the TypeScript standards for this project. Follow them when writing or modifying any TypeScript code. For detailed rationale, examples, and edge cases, see the individual [reference files](references/).

## Avoid Type Assertions

- Never use `as` to silence a type error. Fix the underlying data flow instead of overriding the compiler.
- Never use `any`. Use `unknown` at trust boundaries, then narrow with runtime checks or schema validation (e.g. Zod). Let the validated result flow through with full inference.
- The only acceptable `as` is `as const` (it tightens types, not loosens them).
- If a third-party library has incorrect types, wrap it in a thin adapter with proper types rather than sprinkling assertions throughout the codebase.

## Const Assertions

- Use `as const` on configuration objects, lookup maps, and any data that defines a fixed set of values.
- Use `as const` on arrays that represent a known set of options, then derive union types from them (e.g. `type Status = (typeof STATUS)[number]`).
- Prefer `as const` over manually writing literal union types when the source of truth is an array or object.
- Pair `as const` with `satisfies` when you need both exact literal types and structural validation.

## Early Returns

- Guard against invalid or edge-case inputs at the top of the function and return (or throw) immediately.
- Avoid `else` blocks when the `if` branch already returns. The code after the `if` already knows the condition was false.
- In multi-step transformations, validate and bail out between each step rather than wrapping everything in nested conditionals or try/catch.
- This directly improves type narrowing — each early return eliminates a possibility, giving tighter types for the code that follows.

## Discriminated Unions & Narrowing

- Use a shared literal field (the discriminant) to distinguish between variants. Common discriminants: `type`, `status`, `kind`.
- Narrow using `if`/`switch` on the discriminant, not by checking for optional field existence.
- Avoid modeling variants as a single type with many optional fields — this forces consumers to handle impossible combinations.
- Prefer `switch` with exhaustiveness checking (via a `never` default) when there are three or more variants.

## Inference Over Annotation

- Never annotate a variable when the right-hand side already tells the compiler the type.
- Never annotate function return types, including on exported functions. Let the compiler infer from the implementation.
- Function parameters are the exception — they have no value to infer from, so explicit types are expected there.
- Heavy annotations are a signal that the code structure should be rethought, not papered over with types.
