import type { Metadata } from 'next';
import Link from 'next/link';

import { GuideHero, GuideTrail } from '@/components/marketing/GuideHero';

import { GuideCta } from './_components/GuideCta';
import { PageSchema } from '@/components/PageSchema';
import { getAllArticleMeta } from '@/lib/articles';
import { metadataFor, STATIC_PAGES } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/guides');

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Australia/Perth',
});

export default function GuidesPage() {
  const articles = getAllArticleMeta();

  return (
    <main>
      <PageSchema path="/guides" />
      <GuideHero title="Guides & articles" description={STATIC_PAGES['/guides'].description} />

      <section className="bg-surface-page py-section-half" aria-label="All guides">
        <div className="site-shell">
          <div className="mx-auto max-w-measure-wide">
            <GuideTrail trail={[{ href: '/', label: 'Home' }, { label: 'Guides' }]} />
            <ol className="m-0 list-none p-0">
              {articles.map((article) => (
                <li key={article.slug} className="border-b border-border-default py-xl first:pt-0">
                  <p className="mb-xs text-label font-heavy tracking-label text-text-subtle uppercase">
                    By {article.authorName} | Published{' '}
                    <time dateTime={article.publishedDate}>
                      {dateFormatter.format(new Date(`${article.publishedDate}T00:00:00+08:00`))}
                    </time>
                  </p>
                  <h2 className="m-0 text-title-sm leading-[1.25] font-heavy">
                    <Link
                      href={`/${article.slug}`}
                      className="text-text-primary transition-colors hover:text-text-action"
                    >
                      {article.title}
                    </Link>
                  </h2>
                  <p className="mt-s mb-s text-lead leading-relaxed text-text-secondary">
                    {article.excerpt}
                  </p>
                  <Link
                    href={`/${article.slug}`}
                    className="text-body font-strong text-text-action hover:underline"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    Read the guide →
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <GuideCta kind="website" />
    </main>
  );
}
