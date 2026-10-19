/**
 * GA4 events beyond the page views `GoogleAnalytics` sends.
 *
 * Every call is a no-op until gtag is installed, so a route GA never loaded on
 * (the staff dashboard, the portals) sends nothing. Names are GA4's recommended
 * events where one fits (`generate_lead`, `begin_checkout`, `purchase`), so the
 * reports that understand them light up without custom definitions.
 *
 * Key events in the GA4 property: `generate_lead`, `purchase`, `select_plan`
 * (read from the Admin API on 2026-10-19). Google Ads should import only the
 * first two: `select_plan` is a comparison tap, not a result.
 * Never put personal details (names, emails, phone numbers) in a parameter.
 */

export const CURRENCY = 'AUD';

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_category: 'seo' | 'licensing' | 'website' | 'automation';
  price?: number;
};

export type CheckoutDetails = { value?: number; items: AnalyticsItem[] };

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
}

/** An admin price string as a number, or undefined when it is blank or not a number. */
export function priceValue(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
}

const CHECKOUT_KEY = 'ftd-checkout:';
const PURCHASE_KEY = 'ftd-purchase:';
const SELECT_PLAN_KEY = 'ftd-select-plan:';

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Sends `select_plan` once per visit for each row of plans. A phone visitor
 * taps cards to compare them, and `select_plan` is a key event, so with the
 * property linked to Google Ads every tap went to Ads as a conversion ping;
 * five taps sent five. The plan finally bought rides on `begin_checkout`.
 */
export function trackSelectPlanOnce(category: AnalyticsItem['item_category'], plan: string) {
  const store = storage();
  try {
    if (store?.getItem(SELECT_PLAN_KEY + category)) return;
    store?.setItem(SELECT_PLAN_KEY + category, '1');
  } catch {
    // Without storage every tap sends, as before.
  }
  trackEvent('select_plan', { item_category: category, plan });
}

/**
 * Sends `begin_checkout` and keeps what was bought for the return from Stripe,
 * where the status endpoints no longer carry the price.
 */
export function trackBeginCheckout(key: string, details: CheckoutDetails) {
  trackEvent('begin_checkout', { currency: CURRENCY, ...details });
  try {
    storage()?.setItem(CHECKOUT_KEY + key, JSON.stringify(details));
  } catch {
    // Storage full or blocked: the purchase still sends, without a value.
  }
}

/**
 * Sends `purchase` once per transaction. A reload of the confirmation page
 * would otherwise count the sale again; GA4 also dedupes on `transaction_id`.
 */
export function trackPurchaseOnce(
  checkoutKey: string,
  transactionId: string,
  fallback: CheckoutDetails,
) {
  const store = storage();
  try {
    if (store?.getItem(PURCHASE_KEY + transactionId)) return;
    store?.setItem(PURCHASE_KEY + transactionId, '1');
  } catch {
    // Without storage the GA4 dedupe on transaction_id still applies.
  }

  let details = fallback;
  try {
    const saved = store?.getItem(CHECKOUT_KEY + checkoutKey);
    if (saved) details = JSON.parse(saved) as CheckoutDetails;
  } catch {
    // Unreadable: keep the fallback.
  }

  trackEvent('purchase', { currency: CURRENCY, transaction_id: transactionId, ...details });
}
