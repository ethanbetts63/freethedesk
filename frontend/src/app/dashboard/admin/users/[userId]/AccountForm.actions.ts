'use server';

import { serverApiFetch } from '@/lib/serverApi';
import { STAFF_ACCOUNTS_API, type StaffAccountDetail } from '@/types/StaffAccount';
import { accountSchema } from './AccountForm.schema';

export interface AccountFormState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  account?: StaffAccountDetail;
}

const FAILURE_MESSAGE = 'Could not save. Please try again.';

/** The first message Django gave, whichever field it was about. */
function firstError(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  for (const value of Object.values(body)) {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  }
  return undefined;
}

export async function submitAccount(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = accountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }
  const { id, original_username, username, ...rest } = parsed.data;

  // An unchanged username is left out, so the API can move it with the email.
  const payload = username === original_username ? rest : { ...rest, username };

  let response: Response;
  try {
    response = await serverApiFetch(`${STAFF_ACCOUNTS_API}${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { status: 'error', error: firstError(body) ?? FAILURE_MESSAGE };
  }
  return { status: 'success', account: (await response.json()) as StaffAccountDetail };
}
