/**
 * Format a price in paise-free integer form to Indian Rupee display.
 * @param amount - Price as plain integer (e.g. 2499 = ₹2,499)
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
