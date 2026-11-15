import { FloatingPageCta } from '@/components/FloatingPageCta';
import { CallRequest } from '@/components/marketing/CallRequest';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Hero } from '@/components/marketing/Hero';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { PageSchema } from '@/components/PageSchema';
import { formatMoney } from '@/lib/formatting';
import { buildOneOffOffer } from '@/lib/seo';
import { numberSections } from '@/lib/sectionNumbers';
import { getSiteSettingsServer } from '@/lib/serverApi';

import { seoFaqs } from '../_lib/copy';
import { INDUSTRIES, type IndustryPath } from '../_lib/industries';
import { buildSeoPlans, PRICE_FIELD } from '../_lib/plans';
import { IndustryFindings } from './IndustryFindings';
import { SeoPackages } from './SeoPackages';

const sections = numberSections(['What we find', 'Common questions'] as const);

/**
 * One industry's SEO page: the /seo audits titled for the group, what its prospect reports found
 * most often, its own questions, and the get-in-touch panel. Each route is a two-line page that
 * names its path, so every page is a real file the sitemap and crumb checks can find.
 */
export async function IndustryPage({ path }: { path: IndustryPath }) {
  const industry = INDUSTRIES[path];
  const settings = await getSiteSettingsServer();
  const plans = buildSeoPlans(settings);
  const serviceOffers = plans.flatMap((plan) => {
    const offer = buildOneOffOffer({
      price: Number(settings[PRICE_FIELD[plan.code]]),
      name: `${plan.productName} for ${industry.audience}`,
    });
    return offer ? [offer] : [];
  });
  const fromPrice = formatMoney(
    Math.min(...plans.map((plan) => Number(settings[PRICE_FIELD[plan.code]]))),
    { cents: 'auto' },
  );
  // The group's own questions first, then the guarantee and the price from /seo.
  const general = seoFaqs(settings).filter((item) =>
    ['Is there a money-back guarantee?', 'How much does SEO cost in Perth?'].includes(
      item.question,
    ),
  );

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path={path} serviceOffers={serviceOffers} />
      <Hero
        path={path}
        titleLines={industry.heroLines}
        accentTitle={industry.heroAccent}
        lead={`We've written SEO reports for ${industry.reports} Perth ${industry.audience}. The same few faults hold most of them back, and every audit checks yours for them.`}
        primaryHref="#signup"
        primaryLabel={`Audits from ${fromPrice}`}
        secondaryHref="/seo/sample-report"
        secondaryLabel="See a sample report"
        secondaryNewTab
        trustLine="Money back if your Google clicks don't grow · Paid once, no subscription · Perth-based"
      />

      <SeoPackages settings={settings} audience={industry.audience} />

      <IndustryFindings industry={industry} eyebrow={sections['What we find']} />

      <FloatingPageCta
        label="Choose an audit"
        href="#signup"
        direction="up"
        showAfterId="signup-end"
        hideAtId="call-back"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title={`SEO for ${industry.audience}: common questions.`}
        items={[...industry.faqs, ...general]}
      />

      <CallRequest source={path} />
      <RelatedPages path={path} />
    </main>
  );
}
