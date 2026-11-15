import Image from 'next/image';

import { SplitFeatureSection } from '@/components/SplitFeatureSection';

export function GbpConsistency({ eyebrow }: { eyebrow: string }) {
  return (
    <SplitFeatureSection
      id="consistency"
      eyebrow={eyebrow}
      title="Your website and profile,"
      accentTitle="telling Google the same thing"
      description="Google checks your profile against what it finds elsewhere, starting with your own website. We match the profile's name, address and phone number to your site, and where the site is the one that's wrong, tell you exactly what to change on it. Then we add your booking link and tag the website link, so your analytics can count the visits the profile sends."
      bullets={[
        'Name, address and phone the same on both',
        'A booking link, where you take bookings online',
        'A website link your analytics can count',
      ]}
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
      textSide="right"
      background="white"
      spacing="joined"
    />
  );
}
