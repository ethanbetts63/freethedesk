import type { ReactNode } from 'react';

import { PhoneFrame } from './PhoneFrame';

/**
 * A site as the reports show it: the desktop view in a browser window on the
 * flat slab, with the phone view over the window's bottom-right corner. The
 * report cover draws this with the package's own CSS; the sample report's
 * cover and the case-study heroes draw it here, so the three agree
 * (owner, 2026-11-06). The caller keeps room under it for the phone's overhang.
 */
export function SiteShot({
  url,
  desktop,
  phone,
  caption,
}: {
  url: string;
  desktop: ReactNode;
  phone: ReactNode;
  caption?: string;
}) {
  return (
    <div className="relative">
      <figure className="m-0 overflow-hidden rounded-md border border-border-default bg-surface-page shadow-block-m [&_img]:block [&_img]:h-auto [&_img]:w-full">
        <div className="flex h-l items-center gap-3xs border-b border-border-default bg-surface-muted px-xs">
          <i className="size-xs rounded-circle bg-fill-danger" />
          <i className="size-xs rounded-circle bg-fill-warning" />
          <i className="size-xs rounded-circle bg-fill-success" />
          <span className="mx-auto min-w-0 truncate rounded-xs border border-border-default bg-surface-page px-m py-4xs text-caption text-text-subtle">
            {url}
          </span>
        </div>
        {desktop}
        {caption && <figcaption className="sr-only">{caption}</figcaption>}
      </figure>
      <div className="absolute right-s -bottom-xl w-1/4 min-w-20 sm:right-l sm:-bottom-2xl">
        <PhoneFrame size="fill">{phone}</PhoneFrame>
      </div>
    </div>
  );
}
