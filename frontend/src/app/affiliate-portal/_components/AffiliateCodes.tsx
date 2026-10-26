'use client';

import { useActionState, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cardClassName, cardTitleClassName, messageBodyClassName } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { adminFormControlClassName, adminFormLabelClassName } from '@/components/ui/formControl';
import { removeAffiliateCode, type AffiliateAccount } from '@/lib/affiliateApi';
import { cn } from '@/lib/utils';

import { submitAffiliateCode, type AffiliateCodeState } from './AffiliateCodes.actions';
import { CopyValue } from './CopyValue';

const initialState: AffiliateCodeState = { status: 'idle' };

/**
 * The affiliate's codes: the sign-up one and any they have added, each with its link, and a
 * field to add another. An added code can be switched off; the sign-up one cannot, because
 * listeners already have it. Every change hands the account back up, so the rest of the page
 * follows.
 */
export function AffiliateCodes({
  account,
  onChange,
}: {
  account: AffiliateAccount;
  onChange: (account: AffiliateAccount) => void;
}) {
  const [state, formAction, adding] = useActionState(submitAffiliateCode, initialState);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status !== 'success' || !state.account) return;
    onChange(state.account);
    formRef.current?.reset();
    // Only the submission should apply, not a later change of account.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const remove = async (id: string) => {
    setRemoving(id);
    setRemoveError('');
    try {
      onChange(await removeAffiliateCode(id));
    } catch (reason) {
      setRemoveError(reason instanceof Error ? reason.message : 'That code could not be removed.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <section className={cardClassName}>
      <h2 className={cardTitleClassName}>Your codes</h2>
      <p className={messageBodyClassName}>
        Listeners enter a code at checkout for {account.discount_percent}% off, and every audit
        bought with one of yours is yours. A link opens the SEO page with that code filled in.
      </p>

      <ul className="m-0 mt-m flex list-none flex-col gap-l p-0">
        {account.codes.map((code) => (
          <li
            key={code.id}
            className={cn(
              'flex flex-col gap-s border-t border-border-default pt-m',
              !code.is_active && 'opacity-60',
            )}
          >
            <CopyValue value={code.code} label="Copy code" />
            <CopyValue value={code.share_link} label="Copy link" />
            {!code.is_active ? (
              <p className="m-0 text-label text-text-subtle">
                Switched off. It no longer works at checkout.
              </p>
            ) : code.removable ? (
              <div>
                <Button
                  variant="quiet"
                  type="button"
                  disabled={removing === code.id}
                  onClick={() => remove(code.id)}
                >
                  {removing === code.id ? 'Removing…' : 'Remove this code'}
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {removeError && (
        <Notice tone="danger" size="field">
          {removeError}
        </Notice>
      )}

      <form ref={formRef} action={formAction} className="mt-l border-t border-border-default pt-m">
        <label className={adminFormLabelClassName}>
          Add a code
          <input
            className={adminFormControlClassName}
            name="code"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="e.g. SPARKY"
            maxLength={30}
            required
          />
        </label>
        <p className="m-0 mt-2xs text-label text-text-subtle">
          Letters, digits or hyphens, 3 to 24 of them. It has to be one nobody else holds.
        </p>
        {state.status === 'error' && (
          <Notice tone="danger" size="field">
            {state.error}
          </Notice>
        )}
        <div className="mt-m">
          <Button type="submit" variant="secondary" disabled={adding}>
            {adding ? 'Adding…' : 'Add code'}
          </Button>
        </div>
      </form>
    </section>
  );
}
