import Image from 'next/image';

import { TrafficLights } from '@/components/visuals/chrome';

export type PortfolioImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

/**
 * The browser mockup wrapping the case-study tour screenshots; the hero's is
 * `SiteShot`, shared with the sample report's cover.
 *
 * The site draws five browser windows in total — this one, the two feature
 * visuals, the flow card and the SEO redirect illustration — at four different
 * bar heights with four different contents. The frames themselves stay
 * separate: each is sized to the drawing it belongs to, and a shared one would
 * have to take every dimension as a prop, which is the same code with an extra
 * indirection. What they genuinely shared — the three dots — is `TrafficLights`.
 */
const caseBrowserClassName =
  'overflow-hidden rounded-md border border-border-strong bg-surface-page shadow-block-s [&>img]:block [&>img]:h-auto [&>img]:w-full';

export function BrowserFrame({ image, browserUrl }: { image: PortfolioImage; browserUrl: string }) {
  return (
    <div className={caseBrowserClassName}>
      <div className="flex h-[32px] items-center gap-2xs border-b border-border-default bg-surface-tint-strong px-s">
        <TrafficLights />
        <span className="mx-auto rounded-xs bg-surface-page px-l py-3xs text-caption text-text-subtle lg:px-2xl">
          {browserUrl}
        </span>
      </div>
      <Image
        key={image.src}
        className={image.className}
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
      />
    </div>
  );
}
