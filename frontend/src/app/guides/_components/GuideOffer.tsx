import { CtaButton } from '@/components/CtaButton';
import { money, servicePrices } from '@/lib/servicePricing';
import type { PublicSiteSettings } from '@/lib/api';

export type GuideOfferKind = 'website' | 'redesign' | 'seo' | 'automation' | 'licensing';

/**
 * The box after a guide's first section: the matching service's price and a button to its
 * page, so a reader ready to buy does not have to reach the end first. Priced from the admin
 * like the service pages, so the box cannot quote a figure they do not.
 */
export function GuideOffer({
  kind,
  settings,
}: {
  kind: GuideOfferKind;
  settings: PublicSiteSettings;
}) {
  const prices = servicePrices(settings);
  const offers: Record<GuideOfferKind, { line: string; href: string; label: string }> = {
    website: {
      line: `Websites from ${prices.websiteFrom}, fixed price.`,
      href: '/website-development#packages',
      label: 'See the website packages',
    },
    redesign: {
      line: `Moving off WordPress? Redesigns from ${prices.websiteFrom}, fixed price.`,
      href: '/website-redesign-perth#packages',
      label: 'See the redesign packages',
    },
    seo: {
      line: `SEO audits from ${prices.seoFrom}, with a sample report to read first.`,
      href: '/seo',
      label: 'See the SEO audits',
    },
    automation: {
      line: `Automation starts with a ${prices.discoveryTotal} discovery: your work mapped and the build priced.`,
      href: '/automation#packages',
      label: 'See automation',
    },
    licensing: {
      line: `Online licensing for WA dealers, ${money(settings.licensing_price)} a month.`,
      href: '/licensing#signup',
      label: 'See the plans',
    },
  };
  const offer = offers[kind];

  return (
    <aside className="my-xl flex flex-col gap-m border border-border-default bg-surface-tint p-l sm:flex-row sm:items-center sm:justify-between">
      <p className="m-0 text-body font-strong text-text-primary">{offer.line}</p>
      <CtaButton className="shrink-0 self-start sm:self-auto" href={offer.href} size="compact">
        {offer.label}
      </CtaButton>
    </aside>
  );
}
