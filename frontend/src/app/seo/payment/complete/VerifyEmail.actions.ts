'use server';

import { serverApiFetch } from '@/lib/serverApi';
import { verifyEmailWithCode } from '@/lib/verifyEmailCode';
import { verifyEmailSchema } from './VerifyEmail.schema';

export interface VerifyEmailState {
  status: 'idle' | 'success' | 'error';
  error?: string;
}

const WRONG_CODE =
  'That email and code do not match. Copy the code from your most recent email from us.';
const FAILURE_MESSAGE = 'That password could not be saved. Please try again.';

/** The emailed code proves the address, then becomes the customer's own password, which signs them in. */
export async function submitVerifyEmail(
  _prev: VerifyEmailState,
  formData: FormData,
): Promise<VerifyEmailState> {
  const parsed = verifyEmailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }
  const { email, verification_code, new_password } = parsed.data;

  const result = await verifyEmailWithCode(serverApiFetch, {
    email,
    code: verification_code,
    newPassword: new_password,
  });
  if (result.ok) return { status: 'success' };
  if (result.reason === 'wrong_code') return { status: 'error', error: WRONG_CODE };
  return { status: 'error', error: result.detail ?? FAILURE_MESSAGE };
}
