/**
 * The editor's running totals, in cents so 0.1 + 0.2 stays 30. A preview only: the server
 * recomputes on save with the same rule (round each line, then the tax once on the taxable total).
 */

interface PreviewLine {
  quantity: string;
  unit_price: string;
  taxable: boolean;
}

export interface PreviewTotals {
  subtotal: number;
  tax: number;
  total: number;
}

const toCents = (value: number) => Math.round(value * 100);

export function lineAmount(line: Pick<PreviewLine, 'quantity' | 'unit_price'>): number {
  const amount = Number(line.quantity) * Number(line.unit_price);
  return Number.isFinite(amount) ? toCents(amount) / 100 : 0;
}

export function previewTotals(
  lines: PreviewLine[],
  { taxRate, pricesIncludeTax }: { taxRate: number; pricesIncludeTax: boolean },
): PreviewTotals {
  const amounts = lines.map((line) => ({
    cents: toCents(lineAmount(line)),
    taxable: line.taxable,
  }));
  const subtotal = amounts.reduce((sum, line) => sum + line.cents, 0);
  const taxable = amounts.filter((line) => line.taxable).reduce((sum, line) => sum + line.cents, 0);
  if (taxRate <= 0) return { subtotal: subtotal / 100, tax: 0, total: subtotal / 100 };
  const tax = pricesIncludeTax
    ? Math.round((taxable * taxRate) / (100 + taxRate))
    : Math.round((taxable * taxRate) / 100);
  return {
    subtotal: subtotal / 100,
    tax: tax / 100,
    total: (pricesIncludeTax ? subtotal : subtotal + tax) / 100,
  };
}
