import { BookOpen, Car, FileText, Globe, Search, Workflow } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { GuideCard } from '../_lib/guideView';
import { SectionNumber } from '@/components/SectionNumber';
import { focusRingClassName } from '@/lib/controlState';
import { relatedPagesFor, type RelatedLink } from '@/lib/relatedPages';
import { cn } from '@/lib/utils';

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Australia/Perth',
});

const ICON_CLASS = 'size-[48px] text-text-action';

/** The plain card's mark, for a page with no picture: what the page sells, by its address. Pale, like the pictures. */
function iconFor(href: string) {
  if (href.startsWith('/seo/sample-report'))
    return <FileText className={ICON_CLASS} strokeWidth={1.25} />;
  if (href.startsWith('/seo')) return <Search className={ICON_CLASS} strokeWidth={1.25} />;
  if (href.startsWith('/automation')) return <Workflow className={ICON_CLASS} strokeWidth={1.25} />;
  if (href.startsWith('/dealers') || href.startsWith('/licensing'))
    return <Car className={ICON_CLASS} strokeWidth={1.25} />;
  if (href.startsWith('/portfolio')) return <FileText className={ICON_CLASS} strokeWidth={1.25} />;
  if (href.startsWith('/website')) return <Globe className={ICON_CLASS} strokeWidth={1.25} />;
  return <BookOpen className={ICON_CLASS} strokeWidth={1.25} />;
}

function Picture({ href, image }: { href: string; image: string | null }) {
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
      {iconFor(href)}
    </span>
  );
}

/**
 * The related block a guide ends on, as cards: a picture over each, and a guide's date and reading time. The links
 * are the page's own in `lib/relatedPages`; a guide among them is shown with its picture.
 */
export function GuideCards({ path, guides }: { path: string; guides: readonly GuideCard[] }) {
  const related = relatedPagesFor(path);
  if (!related) return null;
  const bySlug = new Map(guides.map((guide) => [`/${guide.slug}`, guide]));

  return (
    <nav className="bg-surface-page" aria-labelledby="related-pages-title">
      <div className="site-shell py-section">
        <SectionNumber>Related</SectionNumber>
        <h2 id="related-pages-title" className="m-0 text-title tracking-[-0.04em]">
          {related.title}
        </h2>
        <ul className="m-0 mt-xl grid list-none grid-cols-1 gap-l p-0 sm:grid-cols-2 lg:grid-cols-4">
          {related.links.map((link: RelatedLink) => {
            const guide = bySlug.get(link.href);
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
                  <Picture href={link.href} image={guide?.image ?? null} />
                  {guide && (
                    <span className="text-body-sm text-text-muted">
                      <time dateTime={guide.lastModified}>
                        {dateFormatter.format(new Date(`${guide.lastModified}T00:00:00+08:00`))}
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
