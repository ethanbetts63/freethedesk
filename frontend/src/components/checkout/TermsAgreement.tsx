import type { InputHTMLAttributes } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const linkClassName = 'font-heavy text-action-primary underline underline-offset-2';
const linkLineClassName = `inline-flex min-h-[var(--tap-min)] items-center ${linkClassName}`;

/**
 * The terms checkbox. Its sentence is the acceptance statement Django records
 * (`seo_acceptance_statement`, `DEALER_ACCEPTANCE_STATEMENT`,
 * `AFFILIATE_ACCEPTANCE_STATEMENT`), so the words ticked and the words stored
 * stay the same. Without `authorisation` the sentence is the two-document one:
 * "I agree to the X and acknowledge the Privacy Policy."
 *
 * By default the two documents link from their own line under the box, not
 * from inside the sentence: on a phone a tap aimed at a link inside the label
 * ticked the box, and one aimed at the box opened a link. `linksInline` puts
 * them in the sentence instead, for a form whose owner prefers that.
 */
export function TermsAgreement({
  termsHref,
  termsLabel,
  authorisation,
  linksInline = false,
  className,
  ...input
}: {
  termsHref: string;
  termsLabel: string;
  /** How the sentence ends, e.g. "authorise this recurring subscription." */
  authorisation?: string;
  /** Link the documents from the sentence itself rather than a line below it. */
  linksInline?: boolean;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>) {
  const terms = linksInline ? (
    <Link className={linkClassName} href={termsHref} target="_blank" rel="noopener noreferrer">
      {termsLabel}
    </Link>
  ) : (
    termsLabel
  );
  const privacy = linksInline ? (
    <Link className={linkClassName} href="/legal/privacy" target="_blank" rel="noopener noreferrer">
      Privacy Policy
    </Link>
  ) : (
    'Privacy Policy'
  );

  return (
    <div className={cn('text-body-sm leading-normal text-text-muted', className)}>
      <label className="flex min-h-[var(--tap-min)] cursor-pointer items-start gap-s">
        <input
          {...input}
          type="checkbox"
          className="mt-4xs h-[17px] w-[17px] flex-none accent-action-primary"
        />
        <span>
          {authorisation ? (
            <>
              I agree to the {terms}, acknowledge the {privacy}, and {authorisation}
            </>
          ) : (
            <>
              I agree to the {terms} and acknowledge the {privacy}.
            </>
          )}
        </span>
      </label>
      {!linksInline && (
        <p className="m-0 flex flex-wrap gap-x-l">
          <Link
            className={linkLineClassName}
            href={termsHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {termsLabel}
          </Link>
          <Link
            className={linkLineClassName}
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
        </p>
      )}
    </div>
  );
}
