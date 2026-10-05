/**
 * The signup browser's single-use token for choosing the account's first
 * password on the payment confirmation page (`seo/utils/password_claim.py`).
 *
 * httpOnly, and scoped to the payment pages: the confirmation page reads it
 * when it renders, and its Server Action is posted to the same path. Nothing in
 * the browser ever reads it.
 */
export const PASSWORD_CLAIM_PATH = '/seo/payment';

/** A week: long enough to come back and pay; Django closes the claim an hour after payment anyway. */
export const PASSWORD_CLAIM_MAX_AGE = 60 * 60 * 24 * 7;

export function passwordClaimCookie(reference: string): string {
  return `seo-claim-${reference}`;
}
