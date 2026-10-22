import { SectionHeader } from '@/components/SectionHeader';

export function SeoIntroduction() {
  return (
    <section
      className="site-shell pb-xl pt-section lg:text-center"
      id="seo-overview"
      aria-labelledby="seo-overview-title"
    >
      <SectionHeader
        eyebrow="How it works"
        title="Data-driven SEO."
        accentTitle="Not guesswork."
        titleId="seo-overview-title"
        titleClassName="mb-m"
      />
      <p className="m-0 max-w-[62ch] lg:mx-auto text-lead leading-relaxed text-text-muted">
        Every recommendation starts in your own search data and ends with a measurement. You see
        what we found, what to change, and what each change earned.
      </p>
    </section>
  );
}
