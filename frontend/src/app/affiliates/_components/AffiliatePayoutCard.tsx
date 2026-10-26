import { CalendarCheck, Check } from 'lucide-react';

export interface PayoutRow {
  /** "Essentials audit". */
  name: string;
  quantity: number;
  /** The affiliate's half of every one, formatted. */
  amount: string;
}

const FORTNIGHT = 'Fortnight 1–14 Oct';
const PAID_ON = 'Fri 16 Oct';
const NEXT = 'Fri 30 Oct';

/**
 * A fortnight's payout as the affiliate's bank shows it: the amount first,
 * then how many of each audit it came from. The amounts are the live shares,
 * so the card follows the admin's prices.
 */
export function AffiliatePayoutCard({ rows, total }: { rows: PayoutRow[]; total: string }) {
  const count = rows.reduce((sum, row) => sum + row.quantity, 0);
  return (
    <div
      className="moving-colour-border bg-surface-page p-l text-text-primary sm:p-xl"
      role="img"
      aria-label={`A payout notice: ${total} paid on ${PAID_ON} for ${count} audits bought with the code.`}
    >
      <div className="flex items-center gap-s">
        <span className="text-label font-strong tracking-label text-text-muted uppercase">
          Payout
        </span>
        <span className="ml-auto inline-flex items-center gap-2xs rounded-full bg-fill-success px-xs py-4xs text-caption font-bold tracking-wide text-text-on-dark uppercase">
          <Check size={12} strokeWidth={3} aria-hidden="true" /> Arrived
        </span>
      </div>
      <p className="m-0 mt-m text-display leading-none tracking-[-0.05em] tabular-nums">
        <span className="moving-colour-text">{total}</span>
      </p>
      <p className="m-0 mt-xs text-body-sm text-text-muted">
        {PAID_ON} · Stripe · {FORTNIGHT}
      </p>
      <ol className="m-0 mt-l list-none border-t border-border-subtle p-0">
        {rows.map((row) => (
          <li
            key={row.name}
            className="flex items-baseline gap-m border-b border-border-subtle py-s text-body-sm"
          >
            <span className="w-[3ch] text-text-muted tabular-nums">{row.quantity}×</span>
            <span className="min-w-0 flex-1 truncate text-text-secondary">{row.name}</span>
            <span className="font-heavy tabular-nums">{row.amount}</span>
          </li>
        ))}
      </ol>
      <p className="m-0 mt-m flex items-center gap-2xs text-label text-text-muted">
        <CalendarCheck size={16} strokeWidth={1.75} aria-hidden="true" /> Next payout {NEXT}
      </p>
    </div>
  );
}
