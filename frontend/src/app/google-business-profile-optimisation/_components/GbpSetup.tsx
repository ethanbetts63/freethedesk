import Image from 'next/image';

import { SplitFeatureSection } from '@/components/SplitFeatureSection';

const WORK = [
  'Primary and secondary categories',
  'Services, each with a description and a price',
  'The business description',
  'Attributes, such as online appointments and on-site services',
  'Hours and service area',
  'Photos, posts and replies to your reviews',
] as const;

export function GbpSetup({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="set-up"
      eyebrow={eyebrow}
      title="Every part of the profile,"
      accentTitle="filled in properly"
      description="We go through the profile section by section and fill in what is missing or wrong. Nothing is made up: every service, price and opening hour comes from you, and we write it up and put it in."
      bullets={WORK}
      visual={
        <Image
          src="/images/guides/business-not-showing-up-on-google.webp"
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
