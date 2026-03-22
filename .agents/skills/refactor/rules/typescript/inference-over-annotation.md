# Inference Over Annotation

## Intent

TypeScript's type inference is extremely powerful. When you let the compiler infer types, the types stay in sync with the actual runtime values automatically. When you manually annotate, you create a second source of truth that can drift from reality -- and worse, it can _mask_ real errors by telling the compiler "trust me" instead of letting it verify.

The goal is to write code where the types are a natural consequence of the implementation, not a parallel maintenance burden.

## Guidelines

- Never annotate a variable when the right-hand side already tells the compiler the type.
- Never annotate function return types. This includes exported functions and module boundaries.
- Function **parameters** are the one place where explicit types are expected, since there's no value to infer from.
- If you find yourself needing to annotate heavily, it's usually a signal that the code structure should be rethought rather than papered over with types.

## Examples

### Good

```typescript
function getUser(id: string) {
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  return user;
}

const users = ["alice", "bob"].map((name) => ({ name, active: true }));
```

The return type of `getUser` is inferred from `db.users`. If the schema changes, the return type changes automatically and all callers get checked. The `users` array type is inferred as `{ name: string; active: boolean }[]` without any annotation.

### Bad

```typescript
function getUser(id: string): User {
  const user: User | undefined = db.users.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  return user;
}

const users: Array<{ name: string; active: boolean }> = ["alice", "bob"].map(
  (name) => ({ name, active: true }),
);
```

Every annotation here is redundant. The explicit `User` return type is dangerous in this example because the function is local and the implementation already defines the shape. If the db schema changes to include new fields or rename existing ones, the annotation adds friction instead of helping. The variable annotations repeat what the compiler already knows.
