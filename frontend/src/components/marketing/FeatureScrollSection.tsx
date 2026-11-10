import { ServiceScroll, type Service } from '@/components/ServiceScroll';

/** "Website features and integrations we build": a service page's capabilities, scrolled through one at a time. */
export function FeatureScrollSection({
  eyebrow,
  services,
  title = 'Website features and integrations we build',
}: {
  eyebrow: string;
  services: Service[];
  title?: string;
}) {
  return (
    <section className="bg-surface-tint py-section" id="services">
      <div className="site-shell">
        <ServiceScroll services={services} eyebrow={eyebrow} title={title} />
      </div>
    </section>
  );
}
