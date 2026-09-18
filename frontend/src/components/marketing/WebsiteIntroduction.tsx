import { ScrollCtaButton } from '@/components/ScrollCtaButton';
import { SectionNumber } from '@/components/SectionNumber';

const linkClassName =
  'mt-auto inline-flex min-h-[var(--tap-min)] cursor-pointer items-center gap-s self-start border-0 bg-transparent p-0 font-[inherit] text-body font-strong text-text-secondary underline [text-underline-offset:5px] hover:text-action-primary focus-visible:outline-2 focus-visible:outline-action-primary focus-visible:outline-offset-4 [&>span]:text-action-primary';

export function WebsiteIntroduction({
  id = 'website-overview',
  seoDescription = 'Search engine optimisation (SEO) helps your website appear when people search Google for what your business offers.',
  designDescription = 'Clear layouts and simple steps guide visitors towards a purchase, booking or enquiry, on mobile and desktop.',
  automationDescription = 'We connect your website to your business tools to automate data entry, confirmations, invoices and follow-ups.',
}: {
  id?: string;
  seoDescription?: string;
  designDescription?: string;
  automationDescription?: string;
}) {
  return (
    <section className="site-shell pt-section pb-xl" id={id} aria-labelledby={`${id}-title`}>
      <SectionNumber>What we build</SectionNumber>
      <h2 id={`${id}-title`} className="m-0 mb-xl text-display leading-[1.05] tracking-[-0.055em]">
        Three jobs. <span className="moving-colour-text">One website.</span>
      </h2>
      <div className="grid gap-l lg:grid-cols-3 lg:gap-0">
        <div className="flex flex-col border-t border-border-default pt-l lg:border-t-0 lg:px-l lg:py-0 lg:first:pl-0 lg:last:pr-0 lg:[&+div]:border-l lg:[&+div]:border-border-default">
          <h3 className="m-0 text-title-sm tracking-[-0.035em] text-action-primary">1. SEO</h3>
          <p className="mt-s mb-m max-w-[42ch] text-step-0 leading-[1.6] text-text-muted">
            {seoDescription}
          </p>
          <ScrollCtaButton className={linkClassName} targetId="seo">
            Explore SEO <span aria-hidden="true">↘</span>
          </ScrollCtaButton>
        </div>
        <div className="flex flex-col border-t border-border-default pt-l lg:border-t-0 lg:px-l lg:py-0 lg:first:pl-0 lg:last:pr-0 lg:[&+div]:border-l lg:[&+div]:border-border-default">
          <h3 className="m-0 text-title-sm tracking-[-0.035em] text-action-primary">
            2. Website design
          </h3>
          <p className="mt-s mb-m max-w-[42ch] text-step-0 leading-[1.6] text-text-muted">
            {designDescription}
          </p>
          <ScrollCtaButton className={linkClassName} targetId="customer-journeys">
            Explore website design <span aria-hidden="true">↘</span>
          </ScrollCtaButton>
        </div>
        <div className="flex flex-col border-t border-border-default pt-l lg:border-t-0 lg:px-l lg:py-0 lg:first:pl-0 lg:last:pr-0 lg:[&+div]:border-l lg:[&+div]:border-border-default">
          <h3 className="m-0 text-title-sm tracking-[-0.035em] text-action-primary">
            3. Admin automation
          </h3>
          <p className="mt-s mb-m max-w-[42ch] text-step-0 leading-[1.6] text-text-muted">
            {automationDescription}
          </p>
          <ScrollCtaButton className={linkClassName} targetId="website-automation">
            Explore automation <span aria-hidden="true">↘</span>
          </ScrollCtaButton>
        </div>
      </div>
    </section>
  );
}
