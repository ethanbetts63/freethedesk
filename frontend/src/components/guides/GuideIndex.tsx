/* Component registry: freetheplatform/frontend/registry/src/components/guides/GuideIndex.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Image from 'next/image';
import Link from 'next/link';

import { focusRingClassName } from '@/lib/controlState';
import { formatDateLong } from '@/lib/formatting';
import type { GuideCard } from '@/lib/guide';
import { cn } from '@/lib/utils';

/** A site's guides index: every guide as a card, its picture (or a plain card) over its date, title and summary. */
export function GuideIndex({ guides }: { guides: readonly GuideCard[] }) {
  return (
    <ol className="m-0 grid list-none grid-cols-1 gap-x-l gap-y-2xl p-0 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <li key={guide.href} className="flex">
          <Link
            href={guide.href}
            className={cn(
              'group flex flex-1 flex-col gap-s rounded-md no-underline',
              focusRingClassName,
            )}
          >
            {guide.image ? (
              <Image
                src={guide.image}
                alt=""
                width={1536}
                height={1024}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                className="aspect-[3/2] h-auto w-full rounded-md border border-border-default object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="aspect-[3/2] w-full rounded-md border border-border-default bg-surface-tint"
              />
            )}
            <span className="text-body-sm text-text-muted">
              <time dateTime={guide.lastModified}>{formatDateLong(guide.lastModified)}</time>
              {' · '}
              {guide.readMinutes} min read
            </span>
            <h2 className="m-0 text-lead leading-snug font-heavy text-text-primary transition-colors group-hover:text-text-action">
              {guide.title}
            </h2>
            <p className="m-0 text-body leading-relaxed text-text-secondary">{guide.excerpt}</p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
