import type { InputHTMLAttributes } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const linkClassName = 'font-heavy text-action-primary underline underline-offset-2';

/**
 * The terms checkbox. Its sentence is the acceptance statement Django records
 * (`seo_acceptance_statement`, `DEALER_ACCEPTANCE_STATEMENT`,
 * `AFFILIATE_ACCEPTANCE_STATEMENT`), so the words ticked and the words stored
 * stay the same. Without `authorisation` the sentence is the two-document one:
 * "I agree to the X and acknowledge the Privacy Policy." A second set of terms
 * joins the first: "I agree to the X and the Y, and acknowledge the Privacy Policy."
 *
 * The two documents link from inside the sentence. A click on a link follows
 * the link without ticking the box; a click anywhere else on the sentence ticks
 * it.
 */
export function TermsAgreement({
  termsHref,
  termsLabel,
  secondTermsHref,
  secondTermsLabel,
  authorisation,
  className,
  ...input
}: {
  termsHref: string;
  termsLabel: string;
  /** A second document agreed to in the same sentence, e.g. the terms a bundled service runs under. */
  secondTermsHref?: string;
  secondTermsLabel?: string;
  /** How the sentence ends, e.g. "authorise this recurring subscription." */
  authorisation?: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>) {
  const terms = (
    <Link className={linkClassName} href={termsHref} target="_blank" rel="noopener noreferrer">
      {termsLabel}
    </Link>
  );
  const second =
    secondTermsHref && secondTermsLabel ? (
      <>
        {' '}
        and the{' '}
        <Link
          className={linkClassName}
          href={secondTermsHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          {secondTermsLabel}
        </Link>
      </>
    ) : null;
  const privacy = (
    <Link className={linkClassName} href="/legal/privacy" target="_blank" rel="noopener noreferrer">
      Privacy Policy
    </Link>
  );

  return (
    <label
      className={cn(
        'flex min-h-[var(--tap-min)] cursor-pointer items-start gap-s text-body-sm leading-normal text-text-muted',
        className,
      )}
    >
      <input
        {...input}
        type="checkbox"
        className="mt-4xs h-[17px] w-[17px] flex-none accent-action-primary"
      />
      <span>
        {authorisation ? (
          <>
            I agree to the {terms}
            {second}, acknowledge the {privacy}, and {authorisation}
          </>
        ) : (
          <>
            I agree to the {terms}
            {second}
            {second ? ', and' : ' and'} acknowledge the {privacy}.
          </>
        )}
      </span>
    </label>
  );
}
