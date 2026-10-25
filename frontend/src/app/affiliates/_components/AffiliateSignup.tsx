import { SectionHeader } from '@/components/SectionHeader';

import { AffiliateSignupForm } from './AffiliateSignupForm';

const AFTER_SIGNUP = [
  {
    title: 'We email you',
    body: 'Within two working days, with the one or two things we need to start your audit.',
  },
  {
    title: 'You read your audit',
    body: 'The same report your listeners would get, about your own site. Decide if it’s something you’d put your name to.',
  },
  {
    title: 'You get your code',
    body: 'A code and a link to share however suits your show. Every audit bought with it is yours.',
  },
];

/** The sign-up section: what happens next on the left, the form on the right. */
export function AffiliateSignup({ eyebrow }: { eyebrow: string }) {
  return (
    <section
      id="signup"
      className="scroll-mt-[var(--header-height)] bg-surface-tint py-section"
      aria-labelledby="signup-title"
    >
      <div className="site-shell grid grid-cols-1 gap-split lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <SectionHeader
            eyebrow={eyebrow}
            title="Sign up."
            accentTitle="Your audit is on us."
            size="display-md"
            titleBreak="always"
            titleId="signup-title"
          />
          <ol className="m-0 mt-2xl list-none p-0">
            {AFTER_SIGNUP.map((step, index) => (
              <li
                key={step.title}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-m border-t border-border-default py-l"
              >
                <span className="text-label font-black tracking-label-wide text-action-primary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="m-0 mb-xs text-lead tracking-[-0.025em] text-text-secondary">
                    {step.title}
                  </h3>
                  <p className="m-0 text-body leading-relaxed text-text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="border border-border-default bg-surface-page p-xl sm:p-2xl">
          <AffiliateSignupForm />
        </div>
      </div>
      <span id="signup-end" aria-hidden="true" className="block" />
    </section>
  );
}
