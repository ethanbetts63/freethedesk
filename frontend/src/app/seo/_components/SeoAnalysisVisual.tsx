import {
  ChartColumn,
  Gauge,
  Globe,
  ListChecks,
  type LucideIcon,
  MapPin,
  Megaphone,
  MousePointerClick,
  Scale,
  Search,
  Star,
  Swords,
} from 'lucide-react';

import { cn } from '@/lib/utils';

type Tier = 'Essentials' | 'Plus' | 'Complete';

type Size = 'large' | 'wide' | 'small';

type Source = {
  name: string;
  icon: LucideIcon;
  /** The cheapest audit that reads it. */
  tier: Tier;
  size: Size;
};

/**
 * Every source an audit reads, one tile each: the reporting pipeline's
 * collectors (ftp_search/_search/prompts/0[3-5]_collect-*.md) under the names a
 * customer would use. Mirrors the tiers in `_lib/plans.ts` and the SEO Audit
 * Terms: change those and this together.
 *
 * The order is the layout. On four columns the sizes pack into five full rows
 * (4+4+4+4+4 cells); on two they pack into ten. Move a tile and check both.
 */
const sources: readonly Source[] = [
  { name: 'Your website', icon: Globe, tier: 'Essentials', size: 'large' },
  { name: 'Search Console', icon: ChartColumn, tier: 'Essentials', size: 'wide' },
  { name: 'Page speed', icon: Gauge, tier: 'Essentials', size: 'small' },
  { name: 'Search results', icon: Search, tier: 'Essentials', size: 'small' },
  { name: 'Competitors', icon: Swords, tier: 'Essentials', size: 'small' },
  { name: 'Business Profile', icon: MapPin, tier: 'Plus', size: 'small' },
  { name: 'SEO fundamentals', icon: ListChecks, tier: 'Essentials', size: 'wide' },
  { name: 'Reviews', icon: Star, tier: 'Plus', size: 'small' },
  { name: 'Google Ads', icon: Megaphone, tier: 'Complete', size: 'small' },
  { name: 'Visitor behaviour', icon: MousePointerClick, tier: 'Plus', size: 'large' },
  { name: 'Legal', icon: Scale, tier: 'Complete', size: 'wide' },
];

const tierClassName: Record<Tier, string> = {
  Essentials: 'bg-surface-page text-text-primary',
  Plus: 'bg-surface-tint text-text-primary',
  Complete: 'bg-surface-dark text-text-on-dark',
};

const sizeClassName: Record<Size, string> = {
  large: 'col-span-2 row-span-2',
  wide: 'col-span-2',
  small: '',
};

const nameClassName: Record<Size, string> = {
  large: 'text-title',
  wide: 'text-lead',
  small: 'text-body',
};

const iconSize: Record<Size, number> = { large: 48, wide: 36, small: 28 };

/** The sources an audit reads, as a mosaic: a symbol and a name a tile, sized by how much it reads. */
export function SeoAnalysisVisual() {
  return (
    <div
      className="moving-colour-border mx-auto w-full max-w-[620px] min-w-0 p-xl text-text-secondary lg:mx-0 lg:w-auto lg:max-w-none"
      aria-label="The sources an SEO audit reads"
    >
      <ul className="m-0 grid list-none auto-rows-[96px] grid-cols-2 gap-4xs bg-border-default p-0 sm:auto-rows-[108px] sm:grid-cols-4">
        {sources.map(({ name, icon: Icon, tier, size }) => (
          <li
            key={name}
            className={cn(
              'flex flex-col justify-between p-s',
              tierClassName[tier],
              sizeClassName[size],
            )}
          >
            <Icon
              className="shrink-0"
              size={iconSize[size]}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <strong
              className={cn(
                'block leading-tight font-heavy tracking-[-0.02em]',
                nameClassName[size],
              )}
            >
              {name}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
