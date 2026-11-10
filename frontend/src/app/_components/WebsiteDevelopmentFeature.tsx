import Image from 'next/image';

import { CtaButton } from '@/components/CtaButton';
import { SplitFeatureSection } from '@/components/SplitFeatureSection';

const bullets = [
  'Conversion-first customer journeys',
  'Useful tools for customers and staff',
  'Integrations that remove repeated admin',
] as const;

export function WebsiteDevelopmentFeature() {
  return (
    <SplitFeatureSection
      id="websites"
      eyebrow="Web design & development Perth"
      title="Custom websites"
      accentTitle="for Perth businesses"
      description="Custom websites that convert users and automate the repetitive work behind your business."
      bullets={bullets}
      action={
        <CtaButton href="/website-development" size="compact">
          Explore website development
        </CtaButton>
      }
      visual={
        <Image
          src="/images/guides/website-cost-perth.webp"
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
