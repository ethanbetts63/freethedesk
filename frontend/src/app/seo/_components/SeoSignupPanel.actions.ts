'use server';

import { completeSignup, type SignupState } from '@/lib/signup';
import { seoSignupSchema } from './SeoSignupPanel.schema';

export type { SignupState };

export async function submitSeoSignup(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const parsed = seoSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? 'Check the form above.' };
  }

  // The SEO signup endpoint establishes the session itself, so there is no
  // separate login call and no password to carry into one.
  return completeSignup({ endpoint: '/api/seo/signup/', sessionFromSignup: true }, parsed.data);
}
