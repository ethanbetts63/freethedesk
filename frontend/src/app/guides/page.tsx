import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import Link from 'next/link';

import Eyebrow from '@/components/common/eyebrow';
import { PageSchema } from '@/components/PageSchema';
import { SectionNumber } from '@/components/SectionNumber';
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

      <section className="relative overflow-hidden bg-surface-dark py-section-tall text-text-on-dark before:absolute before:inset-0 before:content-[''] before:[background-image:linear-gradient(var(--tint-grid-on-dark)_1px,transparent_1px),linear-gradient(90deg,var(--tint-grid-on-dark)_1px,transparent_1px)] before:[background-size:64px_64px] before:[mask-image:linear-gradient(90deg,var(--text-primary),transparent_82%)] after:absolute after:top-[-26%] after:right-[-8%] after:h-[clamp(230px,34vw,520px)] after:w-[clamp(230px,34vw,520px)] after:rounded-full after:bg-accent after:opacity-[0.12] after:content-[''] after:[filter:blur(1px)]">
        <div className="site-shell relative z-1">
          <div className="mb-xl [--eyebrow-accent:var(--accent)]">
            <Eyebrow dot size="sm" tone="accent">
              Field notes for Perth businesses
            </Eyebrow>
          </div>
          <h1 className="m-0 max-w-[930px] text-hero leading-[0.88] tracking-[-0.075em] sm:text-hero">
            Useful systems.
            <br />
            <em className="not-italic text-accent">Plain English.</em>
          </h1>
          <p className="mt-xl max-w-[660px] text-lead leading-relaxed text-[var(--text-on-dark-muted)]">
            {STATIC_PAGES['/guides'].description}
          </p>
        </div>
        <div
          className="absolute right-[max(32px,calc((100vw-1176px)/2))] bottom-[34px] z-1 hidden items-center gap-s text-label tracking-label text-[var(--text-on-dark-subtle)] lg:flex"
          aria-hidden="true"
        >
          <span>01</span>
          <i className="block h-px w-[80px] bg-[var(--border-on-dark-strong)]" />
        </div>
      </section>

      <Breadcrumbs path="/guides" />

      <section className="bg-surface-page py-section-tall" aria-labelledby="latest-guides">
        <div className="site-shell">
          <header className="mb-xl grid grid-cols-1 items-start gap-2xl border-b border-border-default pb-xl lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:items-end">
            <div>
              <SectionNumber>The guide library</SectionNumber>
              <h2 id="latest-guides" className="m-0 text-hero leading-[0.95] tracking-[-0.065em]">
                Guides you can use.
              </h2>
            </div>
            <p className="mt-0 mb-3xs max-w-[440px] text-lead leading-[1.7] text-text-muted">
              Clear, practical thinking drawn from building websites, web applications and
              automation for real businesses.
            </p>
          </header>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-m lg:grid-cols-2">
              {articles.map((article, index) => (
                <Link
                  className="group flex flex-col border border-border-default p-ml transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:border-action-primary hover:shadow-l sm:p-xl lg:min-h-[440px]"
                  href={`/${article.slug}`}
                  key={article.slug}
                >
                  <div className="flex items-center justify-between text-label font-heavy tracking-label text-text-subtle uppercase">
                    <span className="flex h-[var(--size-control)] w-[var(--size-control)] items-center justify-center rounded-full border border-border-default tracking-normal">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>Guide</span>
                  </div>
                  <div className="my-auto py-2xl">
                    <p className="mb-m text-caption font-heavy tracking-label-tight text-text-action uppercase">
                      By {article.authorName} ·{' '}
                      <time dateTime={article.publishedDate}>
                        {dateFormatter.format(new Date(`${article.publishedDate}T00:00:00+08:00`))}
                      </time>
                    </p>
                    <h3 className="m-0 text-title leading-[1.06] tracking-[-0.045em] transition-colors duration-200 group-hover:text-text-action">
                      {article.title}
                    </h3>
                    <p className="mt-ml max-w-copy text-body leading-relaxed text-text-muted">
                      {article.excerpt}
                    </p>
                  </div>
                  <span className="flex items-center justify-between border-t border-border-default pt-ml text-body-sm font-heavy">
                    Read guide{' '}
                    <b
                      aria-hidden="true"
                      className="text-lead text-text-action transition-transform duration-200 group-hover:translate-x-[5px]"
                    >
                      →
                    </b>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-xl border border-border-default bg-surface-tint px-l py-xl sm:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:px-xl">
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-surface-dark text-label font-heavy text-accent">
                01
              </span>
              <div>
                <h3 className="m-0 mb-xs text-lead tracking-[-0.03em]">
                  The first field note is on the way.
                </h3>
                <p className="m-0 text-body leading-relaxed text-text-muted">
                  We are assembling practical guides for businesses that want clearer websites and
                  less administration.
                </p>
              </div>
              <Link
                href="/contact"
                className="col-start-1 justify-self-start border-b border-text-primary pb-2xs text-body-sm font-heavy sm:col-start-2 lg:col-auto lg:justify-self-auto"
              >
                Ask us a question{' '}
                <b aria-hidden="true" className="ml-xs text-text-action">
                  →
                </b>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
