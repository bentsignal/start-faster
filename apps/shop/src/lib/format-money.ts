export function formatMoney(amount: number | string, currencyCode: string) {
  const parsedAmount =
    typeof amount === "number" ? amount : Number.parseFloat(amount);
  if (Number.isNaN(parsedAmount)) {
    return `${amount} ${currencyCode}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(parsedAmount);
}
