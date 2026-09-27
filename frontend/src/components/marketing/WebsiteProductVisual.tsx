import Image from 'next/image';
import { TrafficLights } from '@/components/visuals/chrome';

/**
 * A dealership website drawn inside a browser window: chrome, nav, hero with a
 * car, and an inventory strip. The nav button, the eyebrow, the CTA and the
 * first inventory bar are all --action-primary, so they move together.
 */
const accentClassName = 'text-action-primary';

/**
 * The spotlight behind the car. A raw colour on purpose: it is a lighting
 * effect in an illustration, not a surface or a border, and no token names it.
 */
const spotlightClassName =
  "before:absolute before:h-[240px] before:w-[280px] before:max-w-full before:content-[''] before:[background:radial-gradient(circle,rgba(77,165,219,0.3),transparent_68%)] sm:before:h-[330px] sm:before:w-[390px]";

export function WebsiteProductVisual() {
  return (
    <div className="w-full min-w-0">
      {/* Turned very slightly away from the reader at desktop width, which is
          the whole reason this is a browser window and not a screenshot. */}
      <div
        className="min-w-0 origin-right bg-surface-page text-text-primary shadow-contrast-l lg:[transform:perspective(1400px)_rotateY(-2deg)]"
        aria-hidden="true"
      >
        <div className="grid h-[var(--size-control)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b border-border-default bg-surface-tint-strong px-s text-caption text-text-muted">
          <TrafficLights />
          <span className="rounded-2xs bg-surface-page px-m py-3xs sm:px-2xl">
            yourdealership.com.au
          </span>
          <b className="hidden justify-self-end text-caption tracking-label-tight text-text-action uppercase sm:block">
            Live preview
          </b>
        </div>
        <div className="flex items-center justify-between px-xl py-l">
          <strong className="text-lead tracking-[-0.06em] [&>span]:text-action-primary">
            north<span>line</span>.
          </strong>
          <div className="flex items-center gap-ml text-caption font-heavy [&>span]:hidden sm:[&>span]:inline">
            <span>Stock</span>
            <span>Service</span>
            <span>About</span>
            <b className="bg-action-primary p-xs text-text-on-dark">Contact</b>
          </div>
        </div>
        <div className="mx-s grid min-h-[330px] grid-cols-[minmax(0,1fr)] items-center overflow-hidden bg-surface-tint p-xl sm:mx-ml sm:p-xl lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <small
              className={`text-caption font-black tracking-label uppercase ${accentClassName}`}
            >
              New arrivals / 2026
            </small>
            <h3 className="my-m text-display leading-[0.86] tracking-[-0.075em]">
              Find your
              <br />
              next car.
            </h3>
            <p className="max-w-[250px] text-label leading-relaxed text-text-muted">
              Explore the latest vehicles, buy online or speak with the team.
            </p>
            <span className="mt-xs inline-block bg-action-primary p-s text-caption font-heavy text-text-on-dark">
              View inventory →
            </span>
          </div>
          <div
            className={`relative flex h-[190px] items-center justify-center overflow-hidden sm:h-[220px] ${spotlightClassName}`}
          >
            <Image
              className="relative z-1 h-full w-full object-contain py-2xs"
              src="/images/car.png"
              alt=""
              width={520}
              height={262}
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center p-m text-caption sm:px-xl sm:py-ml">
          <span className="font-black uppercase">Latest inventory</span>
          <div className="hidden gap-2xs [&>i]:h-[8px] [&>i]:w-[34px] [&>i]:bg-surface-tint-strong [&>i:first-child]:bg-action-primary sm:flex">
            <i />
            <i />
            <i />
          </div>
          <b className={`justify-self-end ${accentClassName}`}>View all 24 →</b>
        </div>
      </div>
    </div>
  );
}
