import { handleResponse } from '@freetheplatform/web-security';

import { authedFetch, type DealerStatus } from './api';

export type CommissionStatus = 'owed' | 'paid' | 'void';

/** One audit bought with the affiliate's code, as the affiliate and staff both see it. */
export interface AffiliateCommission {
  id: number;
  /** The audit, as the customer bought it: "Plus SEO audit". */
  description: string;
  /** What the listener paid for the audit, after their discount. */
  sale_amount: string;
  /** The affiliate's share of it. */
  amount: string;
  currency: string;
  status: CommissionStatus;
  status_label: string;
  note: string;
  paid_at: string | null;
  voided_at: string | null;
  created_at: string;
}

export interface AffiliateEarnings {
  /** Audits that earned something: owed or paid, never void. */
  sales: number;
  owed: string;
  paid: string;
}

/** One of the affiliate's codes: the sign-up one, or one they added. */
export interface AffiliateCode {
  id: string;
  code: string;
  /** The SEO page with this code filled in. */
  share_link: string;
  is_active: boolean;
  /** False for the sign-up code, which listeners already have. */
  removable: boolean;
  created_at: string;
}

/** The signed-in affiliate's own account. */
export interface AffiliateAccount {
  id: number;
  business_name: string;
  contact_name: string;
  email: string;
  website: string;
  status: DealerStatus;
  status_label: string;
  /** The sign-up code, what the welcome email said; empty if it was removed. */
  code: string;
  /** Every code they hold, the sign-up one first. */
  codes: AffiliateCode[];
  /** The code's own percentage off, fixed when it was made. */
  discount_percent: number;
  /** The affiliate's share of what each listener pays. */
  share_percent: number;
  /** The SEO page with the code filled in. */
  share_link: string;
  earnings: AffiliateEarnings;
  commissions: AffiliateCommission[];
  created_at: string;
  updated_at: string;
}

export type AffiliateAccountChanges = Partial<
  Pick<AffiliateAccount, 'business_name' | 'contact_name' | 'website'>
>;

export async function getAffiliateAccount(): Promise<AffiliateAccount> {
  return handleResponse(await authedFetch('/api/affiliates/me/'));
}

/** Switch one of the affiliate's added codes off. Returns the account as it now stands. */
export async function removeAffiliateCode(id: string): Promise<AffiliateAccount> {
  return handleResponse(
    await authedFetch(`/api/affiliates/codes/${encodeURIComponent(id)}/`, { method: 'DELETE' }),
  );
}
