import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';

import { PageSchema } from '@/components/PageSchema';
import { SectionHeader } from '@/components/SectionHeader';
import { metadataFor } from '@/lib/pages';

import { ProjectEnquiry } from '@/components/marketing/ProjectEnquiry';

export const metadata: Metadata = metadataFor('/contact');

const linkClassName = 'font-strong text-text-secondary underline underline-offset-[3px]';

const NEXT_STEPS = [
  {
    title: 'We reply',
    body: 'We read what you sent and reply with what your budget can build, or with the one question we need answered first.',
  },
  {
    title: 'We price it',
    body: (
      <>
        A website usually fits one of our{' '}
        <Link className={linkClassName} href="/website-packages">
          website packages
        </Link>
        . Custom work starts with a{' '}
        <Link className={linkClassName} href="/pricing">
          paid discovery
        </Link>{' '}
        that ends in a written scope.
      </>
    ),
  },
  {
    title: 'You decide',
    body: 'You have the price in writing before any build starts, and nothing is billed until you agree to it.',
  },
];

export default function ContactPage() {
  return (
    <main>
      <PageSchema path="/contact" />

      <Breadcrumbs path="/contact" />
      <ProjectEnquiry
        id="contact-form"
        eyebrow="Contact"
        headingLevel="h1"
        title={
          <>
            Talk to a Perth <span className="moving-colour-text">web developer.</span>
          </>
        }
        lead="Tell us your budget and what you need, and we'll tell you the most valuable thing we can build within it. Or call, if that's quicker."
        footer={
          <dl className="m-0 mt-2xl grid grid-cols-1 gap-l border-t border-border-default pt-xl sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-label font-heavy tracking-label text-text-subtle uppercase">
                Phone
              </dt>
              <dd className="m-0 mt-xs text-lead">
                <a className={linkClassName} href="tel:+61423853830">
                  0423 853 830
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-label font-heavy tracking-label text-text-subtle uppercase">
                Email
              </dt>
              <dd className="m-0 mt-xs text-lead">
                <a className={linkClassName} href="mailto:hello@freethedesk.com.au">
                  hello@freethedesk.com.au
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-label font-heavy tracking-label text-text-subtle uppercase">
                Based in
              </dt>
              <dd className="m-0 mt-xs text-lead text-text-secondary">Dianella, Perth WA</dd>
            </div>
            <div>
              <dt className="text-label font-heavy tracking-label text-text-subtle uppercase">
                ABN
              </dt>
              <dd className="m-0 mt-xs text-lead text-text-secondary">11 493 753 896</dd>
            </div>
          </dl>
        }
      />

      <section className="bg-surface-tint py-section" aria-labelledby="next-steps-title">
        <div className="site-shell">
          <SectionHeader
            eyebrow="What happens next"
            title="Three steps."
            accentTitle="No surprises."
            size="display-md"
            titleId="next-steps-title"
          />
          <ol className="m-0 mt-2xl grid list-none grid-cols-1 gap-4xs p-0 lg:grid-cols-3">
            {NEXT_STEPS.map((step, index) => (
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
    </main>
  );
}
