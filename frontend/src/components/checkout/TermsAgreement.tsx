import type { InputHTMLAttributes } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const linkClassName = 'font-heavy text-action-primary underline underline-offset-2';

/**
 * The terms checkbox. Its sentence is the acceptance statement Django records
 * (`seo_acceptance_statement`, `DEALER_ACCEPTANCE_STATEMENT`), so the words
 * ticked and the words stored stay the same.
 */
export function TermsAgreement({
  termsHref,
  termsLabel,
  authorisation,
  className,
  ...input
}: {
  termsHref: string;
  termsLabel: string;
  /** How the sentence ends, e.g. "authorise this recurring subscription." */
  authorisation: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-s text-label leading-normal text-text-muted',
        className,
      )}
    >
      <input
        {...input}
        type="checkbox"
        className="mt-4xs h-[17px] w-[17px] flex-none accent-action-primary"
      />
      <span>
        I agree to the{' '}
        <Link className={linkClassName} href={termsHref} target="_blank" rel="noopener noreferrer">
          {termsLabel}
        </Link>
        , acknowledge the{' '}
        <Link
          className={linkClassName}
          href="/legal/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </Link>
        , and {authorisation}
      </span>
    </label>
  );
}
