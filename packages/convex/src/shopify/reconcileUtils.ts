export const maxIso = (values: string[]) =>
  values.reduce<string | undefined>((current, value) => {
    if (!current) {
      return value;
    }
    return value > current ? value : current;
  }, undefined);

export const mergeCursor = (previous: string | undefined, next: string | undefined) => {
  if (!previous) {
    return next;
  }
  if (!next) {
    return previous;
  }
  return previous > next ? previous : next;
};
