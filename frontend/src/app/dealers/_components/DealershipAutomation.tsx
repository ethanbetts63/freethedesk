import { ServiceScroll } from '@/components/ServiceScroll';

import { dealerServices } from './dealerServices';

export function DealershipAutomation({ eyebrow }: { eyebrow: string }) {
  return (
    <section className="site-shell" id="services">
      <ServiceScroll
        services={dealerServices}
        eyebrow={eyebrow}
        title="Features we can build in."
      />
    </section>
  );
}
