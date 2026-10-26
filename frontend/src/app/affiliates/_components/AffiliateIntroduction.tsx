import { SectionHeader } from '@/components/SectionHeader';

export function AffiliateIntroduction() {
  return (
    <section
      className="site-shell pb-xl pt-section lg:text-center"
      id="affiliates-overview"
      aria-labelledby="affiliates-overview-title"
    >
      <SectionHeader
        eyebrow="How it works"
        title="Your audience runs businesses."
        accentTitle="Get paid when they grow."
        titleId="affiliates-overview-title"
        titleClassName="mb-m"
      />
      <p className="m-0 max-w-[62ch] lg:mx-auto text-lead leading-relaxed text-text-muted">
        You get a code. Your listeners get a discount on an SEO audit. You get half of every audit
        they buy with it, paid through Stripe, for as long as the episode is listened to.
      </p>
    </section>
  );
}
