'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { PortalField, portalFormActionsClassName } from '@/components/dashboard/PortalField';
import { loginToSale, type CustomerSale } from '@/lib/saleApi';

/**
 * Recovery on another device.
 *
 * There is no account to sign in to. The reference is the username and the
 * password came in the same email as the link — this exists for the customer
 * who opened the link on their phone and wants to finish on a laptop, and for
 * the one who cleared their cookies.
 */
export function SaleLogin({
  reference,
  onSignedIn,
}: {
  reference: string;
  onSignedIn: (sale: CustomerSale) => void;
}) {
  const [error, submit, pending] = useActionState<string, FormData>(async (_prev, form) => {
    const password = String(form.get('password') ?? '').trim();
    if (!password) return 'Enter the password from your email.';
    try {
      onSignedIn(await loginToSale(reference, password));
      return '';
    } catch (reason) {
      return reason instanceof Error ? reason.message : 'Wrong reference or password.';
    }
  }, '');

  return (
    <div className="mx-auto w-full max-w-[480px] px-m py-xl">
      <h1 className="m-0 mb-xs text-display leading-none tracking-[-0.06em]">Your sale</h1>
      <p className="mt-0 mb-l text-body-sm text-text-muted">
        Reference <strong>{reference}</strong>. Enter the password from the email your dealer sent
        you.
      </p>

      {error && <Notice tone="danger">{error}</Notice>}

      <form className="grid gap-m" action={submit}>
        <PortalField
          label="Password"
          name="password"
          type="password"
          autoComplete="one-time-code"
          hint="It is in the same email as your link."
        />
        <div className={portalFormActionsClassName}>
          <Button type="submit" disabled={pending}>
            {pending ? 'Checking…' : 'Open my sale'}
          </Button>
        </div>
      </form>

      <p className="mt-l text-caption text-text-subtle">
        Lost the email? Ask your dealer to send it again — they can, and it takes them one click.
      </p>
    </div>
  );
}
