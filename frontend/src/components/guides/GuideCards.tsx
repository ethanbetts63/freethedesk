/* Component registry: freetheplatform/frontend/registry/src/components/guides/GuideCards.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { focusRingClassName } from '@/lib/controlState';
import { formatDateLong } from '@/lib/formatting';
import type { GuideCard, GuideImage, GuideRelated } from '@/lib/guide';
import { cn } from '@/lib/utils';

function Picture({ image, icon }: { image: GuideImage; icon: ReactNode }) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={1536}
        height={1024}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[3/2] h-auto w-full rounded-md border border-border-default object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex aspect-[3/2] w-full items-center justify-center rounded-md border border-border-default bg-surface-tint"
    >
      {icon}
    </span>
  );
}

/**
 * The related block a guide ends on, as cards: a picture over each, and a guide's date and reading time. A guide
 * among the links is shown as its card, with its picture.
 *
 * Per-site, from the composition: the links (`related`, already resolved; none and the block does not render), the
 * kicker over the heading, and `iconFor`, the pale mark on the plain card of a link with no picture. Icons stay the
 * site's choice.
 */
export function GuideCards({
  related,
  guides,
  kicker,
  iconFor,
}: {
  related: GuideRelated | null;
  guides: readonly GuideCard[];
  kicker: ReactNode;
  iconFor: (href: string) => ReactNode;
}) {
  if (!related || related.links.length === 0) return null;
  const byHref = new Map(guides.map((guide) => [guide.href, guide]));

  return (
    <nav className="bg-surface-page" aria-labelledby="related-pages-title">
      <div className="site-shell py-section">
        {kicker}
        <h2 id="related-pages-title" className="m-0 text-title tracking-[-0.04em]">
          {related.title}
        </h2>
        <ul className="m-0 mt-xl grid list-none grid-cols-1 gap-l p-0 sm:grid-cols-2 lg:grid-cols-4">
          {related.links.map((link) => {
            const guide = byHref.get(link.href);
            return (
              <li key={link.href} className="flex">
                <Link
                  href={link.href}
                  target={link.newTab ? '_blank' : undefined}
                  rel={link.newTab ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'group flex flex-1 flex-col gap-s rounded-md no-underline',
                    focusRingClassName,
                  )}
                >
                  <Picture image={guide?.image ?? null} icon={iconFor(link.href)} />
                  {guide && (
                    <span className="text-body-sm text-text-muted">
                      <time dateTime={guide.lastModified}>
                        {formatDateLong(guide.lastModified)}
                      </time>
                      {' · '}
                      {guide.readMinutes} min read
                    </span>
                  )}
                  <span className="text-lead leading-snug font-strong text-text-primary transition-colors group-hover:text-text-action">
                    {guide?.title ?? link.label}
                  </span>
                  {!guide && (
                    <span className="text-body-sm leading-snug text-text-muted">{link.line}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
