'use client';

import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react';

import {
  adminTableClassName,
  adminTableWrapClassName,
  adminTdClassName,
  adminThClassName,
  CellNote,
  CellTitle,
} from '@/components/dashboard/AdminList';
import { Button } from '@/components/ui/Button';
import { cardClassName, cardTitleClassName, messageBodyClassName } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { adminFormControlClassName, adminFormLabelClassName } from '@/components/ui/formControl';
import {
  removeAffiliateCode,
  setPrimaryAffiliateCode,
  type AffiliateAccount,
  type AffiliateCode,
} from '@/lib/affiliateApi';
import { formatDate } from '@/lib/formatting';
import { cn } from '@/lib/utils';

import { submitAffiliateCode, type AffiliateCodeState } from './AffiliateCodes.actions';

const initialState: AffiliateCodeState = { status: 'idle' };

/** A quiet button that copies `value` and says so for two seconds. */
function CopyButton({ value, children }: { value: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused (permissions, insecure origin): the value is on screen to select by hand.
    }
  };
  return (
    <Button variant="quiet" type="button" onClick={copy}>
      {copied ? 'Copied' : children}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </Button>
  );
}

type Pending = { id: string; action: 'primary' | 'delete' } | null;

/**
 * The affiliate's codes as a table, drawn like the admin list pages: each row is a code with
 * its link, and the actions sit in the last column. One code is the primary, the one the
 * marketing material and the share link carry; it cannot be deleted until another is made
 * primary. Deleting a code takes it out of the table and stops it at checkout; adding the
 * same name again brings it back. Every change hands the account back up, so the rest of the
 * portal follows.
 */
export function AffiliateCodes({
  account,
  onChange,
}: {
  account: AffiliateAccount;
  onChange: (account: AffiliateAccount) => void;
}) {
  const [state, formAction, adding] = useActionState(submitAffiliateCode, initialState);
  const [pending, setPending] = useState<Pending>(null);
  const [actionError, setActionError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status !== 'success' || !state.account) return;
    onChange(state.account);
    formRef.current?.reset();
    // Only the submission should apply, not a later change of account.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const run = async (
    code: AffiliateCode,
    action: NonNullable<Pending>['action'],
    request: (id: string) => Promise<AffiliateAccount>,
    failure: string,
  ) => {
    setPending({ id: code.id, action });
    setActionError('');
    try {
      onChange(await request(code.id));
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : failure);
    } finally {
      setPending(null);
    }
  };

  const isPending = (code: AffiliateCode, action: NonNullable<Pending>['action']) =>
    pending?.id === code.id && pending.action === action;

  return (
    <section className={cardClassName}>
      <h2 className={cardTitleClassName}>Your codes</h2>
      <p className={messageBodyClassName}>
        Add as many codes as you like, one for each place you share. Set one as primary: it is the
        code filled into the copy-and-paste text on the Promote page.
      </p>

      <div className={cn(adminTableWrapClassName, 'mt-m')}>
        <table className={cn(adminTableClassName, 'min-w-[760px]')}>
          <thead>
            <tr>
              <th className={adminThClassName}>Code</th>
              <th className={adminThClassName}>Link</th>
              <th className={adminThClassName}>Added</th>
              <th className={adminThClassName}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {account.codes.map((code) => (
              <tr key={code.id} className={cn(!code.is_active && 'opacity-60')}>
                <td className={adminTdClassName}>
                  <CellTitle>{code.code}</CellTitle>
                  {code.is_primary && <CellNote>Primary</CellNote>}
                  {!code.is_active && <CellNote>Switched off with the account</CellNote>}
                </td>
                <td className={cn(adminTdClassName, 'break-all')}>{code.share_link}</td>
                <td className={cn(adminTdClassName, 'whitespace-nowrap')}>
                  {formatDate(code.created_at)}
                </td>
                <td className={adminTdClassName}>
                  <div className="flex flex-wrap justify-end gap-xs">
                    <CopyButton value={code.code}>Copy code</CopyButton>
                    <CopyButton value={code.share_link}>Copy link</CopyButton>
                    {!code.is_primary && code.is_active && (
                      <Button
                        variant="quiet"
                        type="button"
                        disabled={pending !== null}
                        onClick={() =>
                          run(
                            code,
                            'primary',
                            setPrimaryAffiliateCode,
                            'That code could not be made primary.',
                          )
                        }
                      >
                        {isPending(code, 'primary') ? 'Setting…' : 'Set primary'}
                      </Button>
                    )}
                    {code.removable && (
                      <Button
                        variant="quiet"
                        type="button"
                        disabled={pending !== null}
                        onClick={() =>
                          run(
                            code,
                            'delete',
                            removeAffiliateCode,
                            'That code could not be deleted.',
                          )
                        }
                      >
                        {isPending(code, 'delete') ? 'Deleting…' : 'Delete'}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {actionError && (
        <Notice tone="danger" size="field">
          {actionError}
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
