import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { GuideHero, GuideTrail } from '@/components/marketing/GuideHero';

import { GuideCta } from './_components/GuideCta';
import { guideCards } from './_lib/guideView';
import { PageSchema } from '@/components/PageSchema';
import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';
import { metadataFor, STATIC_PAGES } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/guides');

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Australia/Perth',
});

export default function GuidesPage() {
  const guides = guideCards();

  return (
    <main>
      <PageSchema path="/guides" />
      <GuideHero title="Guides & articles" description={STATIC_PAGES['/guides'].description} />

      <section className="bg-surface-page py-section-half" aria-label="All guides">
        <div className="site-shell">
          <div>
            <GuideTrail trail={[{ href: '/', label: 'Home' }, { label: 'Guides' }]} />
            <ol className="m-0 grid list-none grid-cols-1 gap-x-l gap-y-2xl p-0 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <li key={guide.slug} className="flex">
                  <Link
                    href={`/${guide.slug}`}
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
                      <time dateTime={guide.lastModified}>
                        {dateFormatter.format(new Date(`${guide.lastModified}T00:00:00+08:00`))}
                      </time>
                      {' · '}
                      {guide.readMinutes} min read
                    </span>
                    <h2 className="m-0 text-lead leading-snug font-heavy text-text-primary transition-colors group-hover:text-text-action">
                      {guide.title}
                    </h2>
                    <p className="m-0 text-body leading-relaxed text-text-secondary">
                      {guide.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <GuideCta kind="seo" />
    </main>
  );
}
