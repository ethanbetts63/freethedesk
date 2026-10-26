/* From allbikes' admin statistics (`app/dashboard/admin/statistics/_lib/format.ts`):
   the same axis, tooltip and month formatting, so the two sites' charts read alike. */
export type ValueFormat = 'count' | 'money' | 'percent';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM' → 'Oct 26' for axes, or 'October 2026' in full. */
export function monthLabel(key: string, full = false): string {
  const year = key.slice(0, 4);
  const month = Number(key.slice(5, 7)) - 1;
  if (full) {
    return new Date(Number(year), month, 1).toLocaleString('en-AU', {
      month: 'long',
      year: 'numeric',
    });
  }
  return `${MONTHS[month]} ${year.slice(2)}`;
}

/** The last `count` month keys ending this month, oldest first. */
export function recentMonths(count: number, now = new Date()): string[] {
  const keys: string[] = [];
  for (let back = count - 1; back >= 0; back -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - back, 1);
    keys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

/** The 'YYYY-MM' an ISO timestamp falls in, in the reader's own time zone. */
export function monthOf(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Axis ticks and tiles: clean, compact from 1,000 up ($0 / $1.2K / $35K). */
export function formatCompact(value: number, format: ValueFormat): string {
  if (format === 'percent') return `${Math.round(value)}%`;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const prefix = format === 'money' ? '$' : '';
  let body: string;
  if (abs >= 1_000_000) body = `${trim(abs / 1_000_000)}M`;
  else if (abs >= 1_000) body = `${trim(abs / 1_000)}K`;
  else body = format === 'money' ? trim(abs, abs < 100 ? 2 : 0) : String(Math.round(abs));
  return `${sign}${prefix}${body}`;
}

/** Tooltips and tables: the exact figure. */
export function formatExact(value: number, format: ValueFormat): string {
  if (format === 'percent') return `${value.toFixed(1)}%`;
  if (format === 'money') {
    return value.toLocaleString('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return value.toLocaleString('en-AU');
}

function trim(value: number, places = 1): string {
  return Number(value.toFixed(places)).toString();
}

/** Clean axis ticks from 0 to just above `max`: steps of 1, 2 or 5 × 10ⁿ, about `count` of them. */
export function niceTicks(max: number, count = 4, integers = false): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? 10 * power;
  const safeStep = integers ? Math.max(1, Math.ceil(step)) : step;
  const ticks: number[] = [];
  for (let tick = 0; tick < max + safeStep; tick += safeStep) {
    ticks.push(Number(tick.toFixed(6)));
    if (tick >= max) break;
  }
  return ticks;
}
