/**
 * Current tax rules. This is the module pricing should import from.
 */
export const TAX_RATE = 0.2; // 20% VAT

export function calcTax(taxableAmount: number): number {
  return Math.round(taxableAmount * TAX_RATE);
}
