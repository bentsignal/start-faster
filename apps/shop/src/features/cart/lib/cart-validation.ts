export function assertNonEmptyValue(value: string, fieldName: string) {
  if (value.length === 0) {
    throw new Error(`${fieldName} is required.`);
  }
}

export function assertPositiveInteger(value: number, fieldName: string) {
  if (Number.isInteger(value) === false || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
}
