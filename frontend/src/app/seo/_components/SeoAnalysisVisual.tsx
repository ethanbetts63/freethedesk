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

type Size = 'large' | 'wide' | 'small';

type Tone = 'plain' | 'tint' | 'blue' | 'dark' | 'moving';

type Source = {
  name: string;
  icon: LucideIcon;
  size: Size;
  tone: Tone;
};

/**
 * Every source an audit reads, one tile each: the reporting pipeline's
 * collectors (ftp_search/_search/prompts/0[3-5]_collect-*.md) under the names a
 * customer would use. Keep it in step with the SEO Audit Terms.
 *
 * The order is the layout. On four columns the sizes pack into five full rows
 * (4+4+4+4+4 cells); on two they pack into ten. Move a tile and check both.
 */
const sources: readonly Source[] = [
  { name: 'Your website', icon: Globe, size: 'large', tone: 'moving' },
  { name: 'Search Console', icon: ChartColumn, size: 'wide', tone: 'blue' },
  { name: 'Page speed', icon: Gauge, size: 'small', tone: 'plain' },
  { name: 'Search results', icon: Search, size: 'small', tone: 'tint' },
  { name: 'Competitors', icon: Swords, size: 'small', tone: 'plain' },
  { name: 'Business Profile', icon: MapPin, size: 'small', tone: 'blue' },
  { name: 'SEO fundamentals', icon: ListChecks, size: 'wide', tone: 'tint' },
  { name: 'Reviews', icon: Star, size: 'small', tone: 'plain' },
  { name: 'Google Ads', icon: Megaphone, size: 'small', tone: 'dark' },
  { name: 'Visitor behaviour', icon: MousePointerClick, size: 'large', tone: 'dark' },
  { name: 'Legal', icon: Scale, size: 'wide', tone: 'blue' },
];

const toneClassName: Record<Tone, string> = {
  plain: 'bg-surface-page text-text-primary',
  tint: 'bg-surface-tint text-text-primary',
  blue: 'bg-action-primary text-text-on-dark',
  dark: 'bg-surface-dark text-text-on-dark',
  moving: 'moving-colour-fill text-text-on-dark',
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

/** The sources an audit reads, as a mosaic: a symbol and a name a tile, sized by how much it reads, wall to wall inside the border. */
export function SeoAnalysisVisual() {
  return (
    <div
      className="moving-colour-border mx-auto w-full max-w-[620px] min-w-0 overflow-hidden lg:mx-0 lg:w-auto lg:max-w-none"
      aria-label="The sources an SEO audit reads"
    >
      <ul className="m-0 grid list-none auto-rows-[96px] grid-cols-2 gap-4xs bg-border-default p-0 sm:auto-rows-[108px] sm:grid-cols-4">
        {sources.map(({ name, icon: Icon, size, tone }) => (
          <li
            key={name}
            className={cn(
              'flex flex-col justify-between p-s',
              toneClassName[tone],
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
