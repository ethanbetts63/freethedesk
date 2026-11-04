/* Component registry: freetheplatform/frontend/registry/src/components/guides/GuideArticle.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { GuideAuthorBio, GuideByline } from '@/components/guides/GuideAuthor';
import { GuideContents } from '@/components/guides/GuideContents';
import { GuideTrail, type GuideTrailStep } from '@/components/guides/GuideTrail';
import { formatDateLong } from '@/lib/formatting';
import type { GuideImage, GuidePage } from '@/lib/guide';

/** The hero's picture: the guide's own, or the plain card with the site's mark until it has one. */
function GuidePicture({ image, placeholder }: { image: GuideImage; placeholder: ReactNode }) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={1536}
        height={1024}
        preload
        sizes="(min-width: 1024px) 45vw, 100vw"
        className="aspect-[3/2] h-auto w-full rounded-lg border border-border-default object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex aspect-[3/2] w-full items-center justify-center rounded-lg border border-border-default bg-surface-page"
    >
      {placeholder}
    </span>
  );
}

/**
 * A guide: the heading, its tag, date, reading time and author beside its picture; then the standfirst, "The short
 * answer", the sections listed beside the text, the body, who wrote it, and a link back.
 *
 * Per-site, from the composition: the trail; the `tag` (optional: a site with no topics has none); the `placeholder`
 * mark for a guide with no picture; the back link; and `children`, the body itself, so a site keeps its own prose
 * blocks and whatever it puts between them (an offer box, a carousel). The related cards (`GuideCards`) and a
 * closing CTA follow this, in the composition.
 */
export function GuideArticle({
  guide,
  trail,
  tag,
  placeholder,
  backLink,
  children,
}: {
  guide: GuidePage;
  trail: readonly GuideTrailStep[];
  tag?: string;
  placeholder: ReactNode;
  backLink: { href: string; label: string };
  children: ReactNode;
}) {
  const updated = guide.lastModified !== guide.publishedDate;

  return (
    <>
      <section className="bg-surface-tint">
        <div className="site-shell grid gap-2xl pt-xl pb-section-half lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:pt-section-half">
          <div>
            <GuideTrail trail={trail} />
            <h1 className="m-0 text-title leading-[1.08] font-heavy tracking-[-0.045em] text-text-primary sm:text-display">
              {guide.heading}
            </h1>
            <p className="m-0 mt-l flex flex-wrap items-center gap-x-s gap-y-xs text-body-sm text-text-muted">
              {tag && (
                <span className="rounded-xs border border-border-default bg-surface-page px-xs py-3xs font-strong text-text-action">
                  {tag}
                </span>
              )}
              <span>
                {updated ? 'Updated ' : ''}
                <time dateTime={guide.lastModified}>{formatDateLong(guide.lastModified)}</time>
              </span>
              <span aria-hidden="true">·</span>
              <span>{guide.readMinutes} min read</span>
            </p>
            <GuideByline />
          </div>
          <GuidePicture image={guide.image} placeholder={placeholder} />
        </div>
      </section>

      <section className="bg-surface-page py-section-half">
        <div className="site-shell grid gap-xl lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-2xl">
          <aside className="lg:order-none">
            <div className="lg:sticky lg:top-[calc(var(--header-height-lg)+var(--space-l))]">
              <GuideContents sections={guide.sections} />
            </div>
          </aside>
          <div className="min-w-0 max-w-measure-wide">
            <p className="m-0 text-lead leading-relaxed font-strong text-text-primary">
              {guide.excerpt}
            </p>
            {guide.takeaways.length > 0 && (
              <div className="mt-xl rounded-md border-2 border-action-primary p-l sm:p-xl">
                <p className="m-0 text-label font-heavy tracking-label text-text-action uppercase">
                  The short answer
                </p>
                <ul className="m-0 mt-s flex list-none flex-col gap-s p-0">
                  {guide.takeaways.map((point) => (
                    <li
                      key={point}
                      className="flex gap-s text-body leading-relaxed text-text-secondary"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-xs size-[8px] shrink-0 rounded-circle bg-action-primary"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <article className="mt-xl">{children}</article>
            <GuideAuthorBio />
            <div className="mt-2xl border-t border-border-default pt-xl">
              <Link
                href={backLink.href}
                className="text-body font-strong text-text-action hover:underline"
              >
                {backLink.label}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
