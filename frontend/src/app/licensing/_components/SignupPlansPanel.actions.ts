'use server';

import { completeSignup, type SignupState } from '@/lib/signup';
import { dealerSignupSchema } from './SignupPlansPanel.schema';

export type { SignupState };

export async function submitDealerSignup(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const parsed = dealerSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? 'Check the form above.' };
  }

  return completeSignup({ endpoint: '/api/dealers/signup/' }, parsed.data);
}
