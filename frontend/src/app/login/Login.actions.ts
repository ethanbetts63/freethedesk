'use server';

import { SERVER_API_BASE_URL } from '@/lib/serverApi';
import { relaySetCookies } from '@/lib/serverCookies';
import { loginSchema } from './Login.schema';

export interface LoginState {
  status: 'idle' | 'success' | 'error';
  error?: string;
}

const FAILURE_MESSAGE = 'Login failed.';

export async function submitLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get('identifier'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  let response: Response;
  try {
    response = await fetch(`${SERVER_API_BASE_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: parsed.data.identifier, password: parsed.data.password }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { status: 'error', error: body?.detail ?? FAILURE_MESSAGE };
  }

  await relaySetCookies(response);

  // No redirect here, and no principal in the return either. Where to send
  // somebody is decided from the `Principal`, and this page already has an
  // effect that watches `AuthContext`'s user and does exactly that -- including
  // the must-change-password gate that has to come before any `next`. Handing
  // the principal back through action state would put a second copy of that
  // decision in a second place. The client calls `refresh()` instead, and the
  // effect it already had fires.
  return { status: 'success' };
}
