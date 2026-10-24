import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { Hero } from '@/components/marketing/Hero';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { PageSchema } from '@/components/PageSchema';
import { ProcessStepsBar } from '@/components/ProcessStepsBar';
import { SectionHeader } from '@/components/SectionHeader';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { getSiteSettingsServer } from '@/lib/serverApi';

import { SampleReportLink } from '@/app/seo/_components/SampleReportLink';
import { PartnerSignup } from './_components/PartnerSignup';
import { FREE_AUDIT_CODE, partnerEarnings, partnerFaqs } from './_lib/copy';

const sections = numberSections([
  'How it works',
  'What you earn',
  'What you recommend',
  'Sign up',
  'Common questions',
] as const);

export const metadata: Metadata = metadataFor('/partners');

/* The earnings come from the admin's prices, so this page renders per request. */
export const dynamic = 'force-dynamic';

export default async function PartnersPage() {
  const settings = await getSiteSettingsServer();
  const earnings = partnerEarnings(settings);
  const free = earnings.find((earning) => earning.code === FREE_AUDIT_CODE) ?? earnings[0];
  const lowest = earnings[0];
  const highest = earnings[earnings.length - 1];

  const steps = [
    {
      title: 'Sign up below',
      body: 'Your name, your podcast and the website you’d like audited. It takes a minute.',
    },
    {
      title: 'We write your audit',
      body: `The ${free.name} audit, which customers pay ${free.price} for, free. Read it and decide whether it’s something you’d recommend.`,
    },
    {
      title: 'Share your code',
      body: 'On air, in the show notes, in your newsletter. Your listeners get a discount at checkout, and every audit bought with the code is yours.',
    },
    {
      title: 'Get paid',
      body: `Half of each one: ${lowest.share} to ${highest.share} an audit, paid out through Stripe.`,
    },
  ];

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path="/partners" />
      <Hero
        path="/partners"
        eyebrow="Podcast partner program"
        titleLines={['Recommend an SEO audit.']}
        accentTitle="Keep half."
        lead="Your listeners run businesses. Recommend our SEO audits with your code and keep 50% of every one sold. Your own audit is free, so you know exactly what you're recommending."
        primaryHref="#signup"
        primaryLabel="Become a partner"
        secondaryHref="/seo/sample-report"
        secondaryLabel="See a free sample report"
        trustLine="Free audit for you · 50% of every sale · Paid through Stripe"
      />

      <ProcessStepsBar
        id="partners-hero-end"
        ariaLabel="The four steps of the partner program"
        steps={['Sign up', 'Read your audit', 'Share your code', 'Get paid']}
      />

      <section className="py-section" aria-labelledby="how-title">
        <div className="site-shell">
          <SectionHeader
            eyebrow={sections['How it works']}
            title="Four steps,"
            accentTitle="and the first one is on us."
            size="display-md"
            titleId="how-title"
          />
          <ol className="m-0 mt-2xl grid list-none grid-cols-1 gap-4xs bg-border-default p-0 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="bg-surface-page p-xl">
                <span className="mb-m block text-label font-black tracking-label-wide text-action-primary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="m-0 mb-xs text-lead tracking-[-0.025em] text-text-secondary">
                  {step.title}
                </h3>
                <p className="m-0 text-body leading-relaxed text-text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="bg-surface-dark py-section text-text-on-dark"
        aria-labelledby="earn-title"
      >
        <div className="site-shell">
          <SectionHeader
            eyebrow={sections['What you earn']}
            title="Half of every audit."
            accentTitle="Whichever one they pick."
            size="display-md"
            titleId="earn-title"
            onDark
          />
          <dl className="m-0 mt-2xl grid grid-cols-1 gap-4xs sm:grid-cols-3">
            {earnings.map((earning) => (
              <div
                key={earning.code}
                className="border-t border-border-on-dark pt-l sm:border-t-0 sm:border-l sm:pl-l"
              >
                <dt className="text-label font-heavy tracking-label text-text-on-dark-muted uppercase">
                  {earning.name} audit · {earning.price}
                </dt>
                <dd className="m-0 mt-s">
                  <span className="block text-display leading-none tracking-[-0.055em] text-text-on-dark">
                    {earning.share}
                  </span>
                  <span className="mt-xs block text-body text-text-on-dark-muted">
                    to you, per audit sold with your code
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <SeoReportOverview
        id="sample"
        eyebrow={sections['What you recommend']}
        title="See a free sample report."
        accentTitle="Before you recommend one."
        description="A whole report, written for an invented Perth plumber: where it shows up, who's beating it and the changes ranked by what they're worth. Your own audit will look like this, about your site."
        spacing="standard"
        action={<SampleReportLink />}
      />

      <PartnerSignup eyebrow={sections['Sign up']} />

      <FloatingPageCta
        label="Become a partner"
        href="#signup"
        direction="down"
        showAfterId="partners-hero-end"
        hideAtId="signup-end"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title="Partner questions."
        items={partnerFaqs(settings)}
      />
    </main>
  );
}
