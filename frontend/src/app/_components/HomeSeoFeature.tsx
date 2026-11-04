import { CtaButton } from '@/components/CtaButton';
import { SeoReportOverview } from '@/components/SeoReportOverview';
import { PRICE_FIELD } from '@/app/seo/_lib/plans';
import { formatMoney } from '@/lib/formatting';
import { getSiteSettingsServer } from '@/lib/serverApi';

const SEO_PRICE_FIELDS = Object.values(PRICE_FIELD);

/**
 * The cheapest audit, read from the admin as the price mosaic and /seo read it.
 * If the settings cannot be read the line goes without a figure rather than
 * guessing one.
 */
async function seoFromPrice(): Promise<string | null> {
  try {
    const settings = await getSiteSettingsServer(SEO_PRICE_FIELDS);
    return formatMoney(Math.min(...SEO_PRICE_FIELDS.map((field) => Number(settings[field]))), {
      cents: 'auto',
    });
  } catch (error) {
    console.error('SEO audit price unavailable; the homepage line goes without it.', error);
    return null;
  }
}

export async function HomeSeoFeature() {
  const fromPrice = await seoFromPrice();

  return (
    <SeoReportOverview
      id="seo-reporting"
      className="bg-surface-tint"
      spacing="standard"
      textSide="right"
      eyebrow="SEO Perth"
      title="A ranked SEO action plan."
      accentTitle="Written for humans."
      description={
        <div className="flex flex-col gap-l [&>span]:block">
          <span>
            We find where Perth customers search and don&apos;t find you, rank what to change by
            value, and measure every change as an experiment. One audit, paid once
            {fromPrice ? `, from ${fromPrice}` : ''}; the AI readiness check is free.
          </span>
          <CtaButton className="self-start tracking-label-tight" href="/seo" size="compact">
            Explore SEO
          </CtaButton>
        </div>
      }
    />
  );
}
