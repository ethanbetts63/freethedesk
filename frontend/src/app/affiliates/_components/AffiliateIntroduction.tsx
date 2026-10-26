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
        A plumber, a florist, a physio: each one has a website that could do more. Your code gets
        them an audit at 20% off.
      </p>
    </section>
  );
}
