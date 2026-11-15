import { CtaButton } from '@/components/CtaButton';
import { SectionNumber } from '@/components/SectionNumber';
import { formClassName } from '@/components/forms/selectionFormClassNames';
import { CONTACT } from '@/lib/contact';
import { cn } from '@/lib/utils';

import { CallBookingForm } from './CallBookingForm';

const STEPS = [
  { lead: 'You book', body: 'a time below. All we need is your website and your number.' },
  {
    lead: 'We look',
    body: 'at your site, where it shows on Google Maps and your Business Profile before the call.',
  },
  {
    lead: 'We call',
    body: 'you and go through the three things holding you back. You keep them whether or not you buy anything.',
  },
];

/**
 * The free 30-minute SEO review: what happens, in three steps, beside the booking form. It
 * replaced the project enquiry form everywhere on 2026-11-15. `source` records which page a
 * booking came from, for measuring the call as an offer.
 */
export function CallBooking({
  id = 'book-a-call',
  source,
  eyebrow = 'Free SEO review',
  headingLevel = 'h2',
}: {
  id?: string;
  source: string;
  eyebrow?: string;
  headingLevel?: 'h1' | 'h2';
}) {
  const Heading = headingLevel;
  return (
    <section className="site-shell py-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="moving-colour-border grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col px-ml py-xl text-text-secondary sm:p-2xl">
          <SectionNumber>{eyebrow}</SectionNumber>
          <Heading
            id={`${id}-title`}
            className="m-0 text-display leading-[1.02] tracking-[-0.058em] text-text-secondary"
          >
            Find out what&apos;s holding <span className="moving-colour-text">your site back.</span>
          </Heading>
          <p className="mt-m mb-xl max-w-[470px] text-lead leading-[1.7] text-text-muted">
            A free 30-minute SEO review, by phone. Pick a time and we&apos;ll do the looking first.
          </p>
          <ol className="m-0 grid list-none gap-m p-0">
            {STEPS.map((step, index) => (
              <li key={step.lead} className="grid grid-cols-[auto_minmax(0,1fr)] gap-s">
                <span className="text-label font-black tracking-label-wide text-action-primary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="m-0 text-body leading-relaxed text-text-muted">
                  <strong className="font-heavy text-text-secondary">{step.lead}</strong>{' '}
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-xl mb-xl text-body leading-relaxed text-text-muted">
            <strong className="font-heavy text-text-secondary">Your choice:</strong> make the
            changes yourself, give them to your developer, or have us do them.
          </p>
          <div className="mt-auto">
            <CtaButton href={CONTACT.phoneHref} size="compact" direction="none">
              Or call {CONTACT.phone}
            </CtaButton>
          </div>
        </div>
        <div className={cn(formClassName, 'lg:border-t-0 lg:border-l lg:border-l-border-subtle')}>
          <CallBookingForm source={source} />
        </div>
      </div>
    </section>
  );
}
