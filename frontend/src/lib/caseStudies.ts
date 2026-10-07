/**
 * Scooter Shop's organic growth, the one figure every page quotes.
 *
 * Source: Search Console, sc-domain:scootershop.com.au, web results in
 * Australia, read 2026-10-07. The measurement period is 1 May to 5 October
 * 2026. Growth compares its first four weeks (1 to 28 May) with its last four
 * (8 September to 5 October): equal windows of whole weeks, so neither month
 * length nor the weekly cycle can inflate it.
 *
 * Only the percentage is published. The click counts behind it are the
 * client's private figures and stay out of this repo.
 *
 * Re-read Search Console before changing a number here, and change all of them
 * together: a page that says one figure and a heading that says another is
 * what this file exists to stop.
 */
export const SCOOTER_SHOP_GROWTH = {
  percent: 116,
  stat: '+116%',
  period: '1 May to 5 October 2026',
  span: 'five months',
} as const;
