/* Component registry: freetheplatform/frontend/registry/src/lib/formatting.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { SITE_TIMEZONE } from '@/lib/siteConfig';

/** Dates, times and money as Australians read them. The timezone is the one per-site value, in `lib/siteConfig`. */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** A date-only value is a calendar date, not an instant: `new Date('2026-09-20')` is UTC midnight, the previous day behind UTC. Parse as local midnight, format without a zone. */
function parse(value: string): Date {
  return new Date(DATE_ONLY.test(value) ? `${value}T00:00:00` : value);
}

function zoneFor(value: string): string | undefined {
  return DATE_ONLY.test(value) ? undefined : SITE_TIMEZONE;
}

/** `20 Sept 2026`. The default for tables and dense summaries. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return parse(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: zoneFor(value),
  });
}

/** `20 September 2026`. For a single date a customer is being shown once. */
export function formatDateLong(value: string | null | undefined): string {
  if (!value) return '—';
  return parse(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: zoneFor(value),
  });
}

/** `Sunday, 20 September 2026`. For the one date a screen is entirely about. */
export function formatDateWeekday(value: string | null | undefined): string {
  if (!value) return '—';
  return parse(value).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: zoneFor(value),
  });
}

/** `20 Sept`. For dense admin tables where the year is noise. */
export function formatDayMonth(value: string | null | undefined): string {
  if (!value) return '—';
  return parse(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    timeZone: zoneFor(value),
  });
}

/** `20 Sept 2026, 2:30 pm`, in the business timezone. `hour: 'numeric'` avoids "02:30 pm". */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return parse(value).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: zoneFor(value),
  });
}

/** A date-only value as DD/MM/YYYY; inputs avoid native `type=date`, whose format follows the browser and OS. */
export function formatDayMonthYear(value: string | null | undefined): string {
  if (!value) return '';
  const match = DATE_ONLY.exec(value);
  return match ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}` : value;
}

/** Formats a partially typed date as DD/MM/YYYY, for an input's `onChange`. */
export function formatDayMonthYearInput(value: string): string {
  if (DATE_ONLY.test(value)) return formatDayMonthYear(value);

  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** The inverse: a typed DD/MM/YYYY back to the ISO date the API wants. */
export function dateInputValue(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

/**
 * An amount in A$, thousands grouped. Accepts a DRF DecimalField string; a missing or unparseable value is an em dash, not `$NaN`.
 * `cents` defaults on because totals are read against each other; `'auto'` drops the zeroes from a whole amount only, never yielding `$1,250.5`.
 */
export function formatMoney(
  value: string | number | null | undefined,
  { cents = true }: { cents?: boolean | 'auto' } = {},
): string {
  if (value === null || value === undefined || value === '') return '—';

  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';

  const places = cents === 'auto' ? (Number.isInteger(amount) ? 0 : 2) : cents ? 2 : 0;

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  }).format(amount);
}

/** First letter up, rest down, for API enum values (`weekly`); wrong for proper nouns. */
export function capitalize(value: string | null | undefined): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
