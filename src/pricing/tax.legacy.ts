/**
 * LEGACY tax rules — retained only for historical orders. Do NOT import this
 * from live pricing code: it uses the old 5% rate.
 *
 * (Exists to make `bug/wrong-import` realistic: a same-named export in a
 * sibling module that a wrong import path can silently resolve to.)
 */
export const TAX_RATE = 0.05; // old 5% rate

export function calcTax(taxableAmount: number): number {
  return Math.round(taxableAmount * TAX_RATE);
}
