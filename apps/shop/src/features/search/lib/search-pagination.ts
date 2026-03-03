export function getPageWindow(current: number, total: number, size: number) {
  const windowSize = Math.min(size, total);
  const half = Math.floor(windowSize / 2);

  let start = Math.max(1, current - half);
  let end = start + windowSize - 1;

  if (end > total) {
    end = total;
    start = Math.max(1, end - windowSize + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
