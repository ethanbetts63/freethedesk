import Image from 'next/image';

import { CtaButton } from '@/components/CtaButton';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';

export function AutomationFeature() {
  return (
    <SplitFeatureSection
      id="automation"
      eyebrow="Business automation Perth"
      title="Business and AI"
      accentTitle="automation"
      description="We connect the systems you already use and build the missing pieces, so information moves without your team moving it by hand."
      action={
        <CtaButton href="/automation" size="compact">
          Explore business automation
        </CtaButton>
      }
      visual={
        <Image
          src="/images/guides/what-to-automate-in-a-small-business.webp"
          alt=""
          width={1536}
          height={1024}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="aspect-[3/2] h-auto w-full rounded-lg border border-border-default object-cover"
        />
      }
      textSide="left"
      spacing="joined"
    />
  );
}
