import Image from 'next/image';

import { SplitFeatureSection } from '@/components/SplitFeatureSection';

const WORK = [
  'Categories, services and prices',
  'Description, attributes, hours and service area',
  'Photos, posts and replies to your reviews',
  'Name, address and phone matching your website',
  'A booking link and a website link your analytics can count',
] as const;

export function GbpSetup({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="set-up"
      eyebrow={eyebrow}
      title="Every part of the profile,"
      accentTitle="filled in properly"
      description="We fill in what is missing or wrong, and match the profile to your website. Every fact comes from you."
      bullets={WORK}
      visual={
        <Image
          src="/images/seo/what-google-looks-at.webp"
          alt=""
          width={1536}
          height={1024}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="aspect-[3/2] h-auto w-full rounded-lg border border-border-default object-cover"
        />
      }
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}
