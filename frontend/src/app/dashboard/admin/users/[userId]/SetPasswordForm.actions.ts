'use server';

import { serverApiFetch } from '@/lib/serverApi';
import { STAFF_ACCOUNTS_API } from '@/types/StaffAccount';
import { setPasswordSchema } from './SetPasswordForm.schema';

export interface SetPasswordState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

const FAILURE_MESSAGE = 'That password could not be set.';

export async function submitSetPassword(
  _prev: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const parsed = setPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }
  const { id, new_password } = parsed.data;

  let response: Response;
  try {
    response = await serverApiFetch(`${STAFF_ACCOUNTS_API}${id}/password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_password }),
    });
  } catch {
    return { status: 'error', message: FAILURE_MESSAGE };
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    return { status: 'error', message: body?.new_password?.[0] ?? body?.detail ?? FAILURE_MESSAGE };
  }
  return { status: 'success', message: body?.detail };
}
