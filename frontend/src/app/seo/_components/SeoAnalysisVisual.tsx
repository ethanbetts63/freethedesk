import { cn } from '@/lib/utils';

import { LiveDot } from '@/components/visuals/ChecklistCard';

type Tier = 'Essentials' | 'Plus' | 'Complete';

type Source = {
  name: string;
  /** What this source tells the report, in one line. */
  reads: string;
  /** The cheapest audit that reads it. */
  tier: Tier;
  /** Grid placement for the tiles that take more room. */
  className?: string;
};

/**
 * Every source an audit reads, one tile each: the reporting pipeline's
 * collectors (ftp_search/_search/prompts/0[3-5]_collect-*.md) under the names a
 * customer would use. Mirrors the tiers in `_lib/plans.ts` and the SEO Audit
 * Terms: change those and this together.
 */
const sources: readonly Source[] = [
  {
    name: 'Your website',
    reads: 'Walked page by page, as a visitor would, on a computer and on a phone.',
    tier: 'Essentials',
    className: 'col-span-2',
  },
  { name: 'Page speed', reads: 'Google’s own lab test of your main pages.', tier: 'Essentials' },
  {
    name: 'Search Console',
    reads: 'The searches that bring people to you, and where you rank for them.',
    tier: 'Essentials',
  },
  {
    name: 'Search results',
    reads: 'What Google and its AI answers show for the searches you should win.',
    tier: 'Essentials',
  },
  {
    name: 'Competitors',
    reads: 'What the sites above you give a buyer that yours doesn’t.',
    tier: 'Essentials',
  },
  {
    name: 'SEO fundamentals',
    reads: 'A catalogue of common failure points, each backed by a study.',
    tier: 'Essentials',
  },
  { name: 'Business Profile', reads: 'Your listing on the map.', tier: 'Plus' },
  { name: 'Reviews', reads: 'Yours and your two main rivals’, read whole.', tier: 'Plus' },
  {
    name: 'Visitor behaviour',
    reads: 'Where people click, read and give up.',
    tier: 'Plus',
  },
  { name: 'Google Ads', reads: 'What you pay for, and who bids against you.', tier: 'Complete' },
  { name: 'Legal', reads: 'What Australian law asks of your website.', tier: 'Complete' },
];

const tierClassName: Record<Tier, string> = {
  Essentials: 'bg-surface-page text-text-secondary',
  Plus: 'bg-surface-tint text-text-secondary',
  Complete: 'bg-surface-dark text-text-on-dark',
};

const tierTagClassName: Record<Tier, string> = {
  Essentials: 'text-text-subtle',
  Plus: 'text-action-primary',
  Complete: 'text-text-on-dark-muted',
};

/** The sources an audit reads, as a mosaic: one tile a source, shaded by the audit that adds it. */
export function SeoAnalysisVisual() {
  return (
    <div
      className="moving-colour-border mx-auto w-full max-w-[620px] min-w-0 p-xl text-text-secondary lg:mx-0 lg:w-auto lg:max-w-none"
      aria-label="The sources an SEO audit reads, and which audit adds each one"
    >
      <header className="flex items-center justify-between gap-s border-b border-border-subtle pb-m">
        <div className="flex items-center gap-s">
          <LiveDot />
          <span>
            <small className="mb-4xs block text-caption font-black tracking-label text-text-muted uppercase">
              What we read
            </small>
            <strong className="block text-body-sm">Eleven sources, one report</strong>
          </span>
        </div>
        <span className="moving-colour-text text-label font-black uppercase">
          {sources.length} sources
        </span>
      </header>

      <ul className="m-0 mt-xl grid list-none grid-cols-2 gap-4xs bg-border-default p-0 sm:grid-cols-3">
        {sources.map((source) => (
          <li
            key={source.name}
            className={cn(
              'flex flex-col gap-2xs p-m',
              tierClassName[source.tier],
              source.className,
            )}
          >
            <span
              className={cn(
                'text-caption font-black tracking-label-tight uppercase',
                tierTagClassName[source.tier],
              )}
            >
              {source.tier}
            </span>
            <strong className="block text-body-sm">{source.name}</strong>
            <small
              className={cn(
                'block text-label leading-[1.4]',
                source.tier === 'Complete' ? 'text-text-on-dark-muted' : 'text-text-muted',
              )}
            >
              {source.reads}
            </small>
          </li>
        ))}
      </ul>

      <p className="m-0 mt-m text-caption text-text-subtle">
        Each tile is shaded by the audit that adds it: Essentials, Plus, Complete.
      </p>
    </div>
  );
}
