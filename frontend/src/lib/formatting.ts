/* Component registry: freetheplatform/frontend/registry/src/lib/formatting.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { SITE_TIMEZONE } from '@/lib/siteConfig';

/**
 * Dates, times and money as Australians read them.
 *
 * One module per app, and the same module in each, because the three had
 * converged on the same idea and disagreed on every detail of it: only one
 * guarded against `$NaN`, only one parsed a date-only value correctly, and the
 * one that rendered cents "only when there are cents" printed $1,250.5 for a
 * dollar-fifty balance. Every call site in all three now gets the union of
 * what each had got right.
 *
 * The timezone is the one per-site value and lives in `lib/siteConfig`.
 */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A date-only API value is a calendar date, not an instant. `new Date('2026-09-20')`
 * parses as UTC midnight, which renders as the previous day anywhere behind UTC
 * and drags the value through a timezone conversion it has no business in.
 * Parsing it as local midnight and formatting without a zone makes the day
 * displayed always the day sent — including on a server that is not in ours.
 */
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

/**
 * `20 Sept 2026, 2:30 pm`, in the timezone the business runs on.
 *
 * `hour: 'numeric'` rather than `'2-digit'`: a leading zero on a 12-hour clock
 * ("02:30 pm") is a digital-watch convention, not how the time is written.
 */
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

/**
 * Shows a date-only API value in the format customers and staff use here.
 * Date inputs are deliberately not native `type=date` controls, whose visible
 * format is chosen by the browser and OS and can otherwise show month/day/year.
 */
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
 * An amount as it is read here: A$, thousands grouped. Accepts the string DRF
 * sends for a DecimalField, and renders a missing or unparseable value as an
 * em dash rather than `$NaN` — which is what two of the three did before, the
 * first time an API sent `"N/A"` or an empty decimal.
 *
 * `cents` is the transactional default because a total, a deposit and a
 * balance are read against each other and `$12` beside `$12.50` reads as a
 * different kind of number. `'auto'` drops the pair of zeroes from a whole
 * amount, for a marketing price that is never itemised — and drops *both* or
 * neither, so a plan at $1,250.50 does not advertise itself as $1,250.5.
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

/**
 * First letter up, rest down. Written for API enum values — `weekly`,
 * `fortnightly` — so the lowercasing is deliberate. It is the wrong tool for
 * anything with a proper noun in it.
 */
export function capitalize(value: string | null | undefined): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
