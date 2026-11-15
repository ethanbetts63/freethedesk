import { CtaButton } from '@/components/CtaButton';
import { SectionNumber } from '@/components/SectionNumber';
import { formClassName } from '@/components/forms/selectionFormClassNames';
import { CONTACT } from '@/lib/contact';
import { cn } from '@/lib/utils';

import { CallRequestForm } from './CallRequestForm';

const STEPS = [
  { lead: 'You leave', body: 'your number, and your website if you have one.' },
  {
    lead: 'We look',
    body: 'at your site, where it shows on Google Maps and your Business Profile.',
  },
  { lead: 'We ring', body: 'you back as soon as we can, with what is holding your site back.' },
];

/**
 * Ask for a call back, beside three steps saying what happens. It replaced the project enquiry
 * form everywhere, and then the timed booking (2026-11-15). `source` records which page a
 * request came from.
 */
export function CallRequest({
  id = 'call-back',
  source,
  eyebrow = 'Talk to us',
}: {
  id?: string;
  source: string;
  eyebrow?: string;
}) {
  return (
    <section className="site-shell py-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="moving-colour-border grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col px-ml py-xl text-text-secondary sm:p-2xl">
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2
            id={`${id}-title`}
            className="m-0 text-display leading-[1.02] tracking-[-0.058em] text-text-secondary"
          >
            Find out what&apos;s holding <span className="moving-colour-text">your site back.</span>
          </h2>
          <ol className="m-0 mt-xl grid list-none gap-m p-0">
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
          <CallRequestForm source={source} />
        </div>
      </div>
    </section>
  );
}
