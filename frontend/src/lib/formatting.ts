/**
 * Dates, times and money as Australians read them.
 *
 * `formatDateTime` and `formatPrice` used to live in lib/api.ts, an HTTP
 * module, which is why lib/adminApi.ts had to re-export them to reach the
 * dashboard. Presentation is not transport; it gets its own file, the same one
 * allbikes and bloomprint have.
 *
 * Four price call sites also wrote `$${n.toLocaleString('en-AU')}` inline
 * rather than calling formatPrice, and ProjectEnquiryPanel carried a fifth
 * spelling. A currency symbol glued to a grouped number is not the same thing
 * as a currency format, and the difference shows the moment a value is
 * negative or the locale is not this one.
 */

const SITE_TIMEZONE = 'Australia/Perth';

/**
 * An amount as it is read here: A$ with cents only when there are cents.
 * Accepts the string DRF sends for a DecimalField, and renders a missing or
 * unparseable value as an em dash rather than `$NaN`.
 */
export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** `20 Sep 2026, 2:30 pm`, in the timezone the business runs on. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: SITE_TIMEZONE,
  });
}

/** `20 Sep 2026`. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: SITE_TIMEZONE,
  });
}
