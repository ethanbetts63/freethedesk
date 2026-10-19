import type { InputHTMLAttributes } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const linkClassName =
  'inline-flex min-h-[var(--tap-min)] items-center font-heavy text-action-primary underline underline-offset-2';

/**
 * The terms checkbox. Its sentence is the acceptance statement Django records
 * (`seo_acceptance_statement`, `DEALER_ACCEPTANCE_STATEMENT`), so the words
 * ticked and the words stored stay the same.
 *
 * The two documents link from their own line under the box, not from inside
 * the sentence: on a phone a tap aimed at a link inside the label ticked the
 * box, and one aimed at the box opened a link.
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
    <div className={cn('text-body-sm leading-normal text-text-muted', className)}>
      <label className="flex min-h-[var(--tap-min)] cursor-pointer items-start gap-s">
        <input
          {...input}
          type="checkbox"
          className="mt-4xs h-[17px] w-[17px] flex-none accent-action-primary"
        />
        <span>
          I agree to the {termsLabel}, acknowledge the Privacy Policy, and {authorisation}
        </span>
      </label>
      <p className="m-0 flex flex-wrap gap-x-l">
        <Link className={linkClassName} href={termsHref} target="_blank" rel="noopener noreferrer">
          {termsLabel}
        </Link>
        <Link
          className={linkClassName}
          href="/legal/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
