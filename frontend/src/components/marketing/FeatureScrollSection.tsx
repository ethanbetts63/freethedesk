import { ServiceScroll, type Service } from '@/components/ServiceScroll';

/** "Features we can build in": a service page's capabilities, scrolled through one at a time. */
export function FeatureScrollSection({
  eyebrow,
  services,
  ctaLabel,
  title = 'Features we can build in.',
}: {
  eyebrow: string;
  services: Service[];
  ctaLabel: string;
  title?: string;
}) {
  return (
    <section className="bg-surface-tint py-section" id="services">
      <div className="site-shell">
        <ServiceScroll
          services={services}
          customHref="#enquiry"
          ctaLabel={ctaLabel}
          eyebrow={eyebrow}
          title={title}
          showCustomCta={false}
        />
      </div>
    </section>
  );
}
