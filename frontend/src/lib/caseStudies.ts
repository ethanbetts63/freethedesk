/**
 * Scooter Shop's organic growth, the one figure every page quotes.
 *
 * Source: Search Console, sc-domain:scootershop.com.au, web results in
 * Australia, the stored daily series read 2026-11-06. Growth compares two
 * whole calendar months six months apart: April 2026 with October 2026.
 * The four weeks to 3 May against the four weeks to 31 October give the
 * same figure within two points, so neither month length nor the weekly
 * cycle is doing the work. Impressions grew faster still over the same
 * months.
 *
 * Only the percentage is published. The click counts behind it are the
 * client's private figures and stay out of this repo.
 *
 * Re-read Search Console before changing a number here, and change all of them
 * together: a page that says one figure and a heading that says another is
 * what this file exists to stop.
 */
export const SCOOTER_SHOP_GROWTH = {
  percent: 157,
  stat: '+157%',
  period: 'April to October 2026',
  span: 'six months',
} as const;
