'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { CheckoutButton } from '@/components/checkout/CheckoutButton';
import { Notice } from '@/components/ui/Notice';
import { submitUnsubscribe, type UnsubscribeState } from './Unsubscribe.actions';

const initialState: UnsubscribeState = { status: 'idle' };

/**
 * One button. The link in the email only opens this page; the address comes
 * off the list when the button is pressed, because corporate mail scanners
 * open every link in an email before a person does, and a link that
 * unsubscribed on arrival would opt out people who never clicked.
 */
export function UnsubscribeForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(submitUnsubscribe, initialState);

  if (state.status === 'success') {
    return <Notice tone="success">Done. We won&apos;t email this address again.</Notice>;
  }

  return (
    <form className="mt-xl flex flex-col gap-m" action={formAction}>
      {/* From the route, not from the person; the action bounds it anyway. */}
      <input type="hidden" name="token" value={token} />
      {state.status === 'error' && (
        <Notice tone="danger" size="field">
          {state.error}
        </Notice>
      )}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <CheckoutButton type="submit" busy={pending} disabled={pending}>
      <span>{pending ? 'One moment…' : 'Unsubscribe'}</span>
      <b aria-hidden="true">→</b>
    </CheckoutButton>
  );
}
