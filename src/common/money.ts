/** Formats an integer pence amount as a human-readable GBP string. */
export function formatMoney(amountInPence: number): string {
  return `£${(amountInPence / 100).toFixed(2)}`;
}
