export function getPageWindow(current: number, total: number, size: number) {
  if (
    Number.isFinite(current) === false ||
    Number.isFinite(total) === false ||
    Number.isFinite(size) === false ||
    total < 1 ||
    size <= 0
  ) {
    return [];
  }

  const normalizedTotal = Math.floor(total);
  const normalizedSize = Math.min(Math.floor(size), normalizedTotal);
  const normalizedCurrent = Math.min(
    Math.max(Math.floor(current), 1),
    normalizedTotal,
  );
  const windowSize = Math.min(normalizedSize, normalizedTotal);
  const half = Math.floor(windowSize / 2);

  let start = Math.max(1, normalizedCurrent - half);
  let end = start + windowSize - 1;

  if (end > normalizedTotal) {
    end = normalizedTotal;
    start = Math.max(1, end - windowSize + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
