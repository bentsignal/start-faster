# Early Returns

## Intent

Deeply nested conditionals obscure the main logic of a function behind layers of indentation. Early returns flip this around -- handle the edge cases and bail out first, so the "happy path" reads linearly at the top level. This isn't just a style preference; it directly impacts how well the compiler narrows types through control flow. Each early return eliminates a possibility, giving you tighter types for the code that follows without any manual narrowing.

## Guidelines

- Guard against invalid or edge-case inputs at the top of the function and return (or throw) immediately.
- Avoid `else` blocks when the `if` branch returns. The code after the `if` already knows the condition was false.
- In functions that transform data through multiple steps, validate and bail out between each step rather than wrapping everything in try/catch or nested ifs.

## Examples

### Good

```typescript
function processOrder(order: Order | null) {
  if (!order) return null
  if (order.status === "cancelled") return null

  const total = calculateTotal(order.items)
  if (total <= 0) throw new Error("Order total must be positive")

  return submitOrder(order, total)
}
```

Each guard eliminates one edge case. By the time you reach `submitOrder`, you know `order` is non-null, not cancelled, and has a positive total. The logic reads top to bottom with no nesting.

### Bad

```typescript
function processOrder(order: Order | null) {
  if (order) {
    if (order.status !== "cancelled") {
      const total = calculateTotal(order.items)
      if (total > 0) {
        return submitOrder(order, total)
      } else {
        throw new Error("Order total must be positive")
      }
    } else {
      return null
    }
  } else {
    return null
  }
}
```

The core logic (`submitOrder`) is buried three levels deep. Adding another condition means adding another nesting level. It's harder to see at a glance what the function actually does.
