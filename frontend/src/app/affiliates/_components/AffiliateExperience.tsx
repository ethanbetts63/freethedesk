import Image from 'next/image';

import { SplitFeatureSection } from '@/components/SplitFeatureSection';

/** What an affiliate says: their own audit first, then their own words. */
export function AffiliateExperience({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="experience"
      eyebrow={eyebrow}
      title="Get a free audit."
      accentTitle="Speak from experience."
      description="We'd rather you were honest than enthusiastic. A free audit of your site, ad copy if you want it, and your own opinion either way."
      visual={
        <Image
          src="/images/affiliates/speaking.webp"
          alt="A line drawing of a host in headphones talking into a microphone beside a laptop."
          width={1200}
          height={728}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="mx-auto h-auto w-full max-w-[620px] lg:mx-0 lg:max-w-none"
        />
      }
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
