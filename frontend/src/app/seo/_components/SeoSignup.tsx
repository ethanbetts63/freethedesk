import { SectionNumber } from '@/components/SectionNumber';
import { type PublicSiteSettings } from '@/lib/api';
import { SeoSignupPanel } from './SeoSignupPanel';

/* Server shell: only the report chooser and the form need to hydrate. */
export function SeoSignup({
  settings,
  eyebrow,
}: {
  settings: PublicSiteSettings;
  eyebrow: string;
}) {
  return (
    <section
      className="site-shell pt-2xl pb-section [scroll-margin-top:28px] sm:pt-section sm:[scroll-margin-top:24px]"
      id="signup"
    >
      <SeoSignupPanel
        settings={settings}
        heading={
          <>
            <SectionNumber>{eyebrow}</SectionNumber>
            <h2 className="m-0 max-w-[780px] text-display-3 leading-[1.06] tracking-[-0.058em]">
              Choose your report.
            </h2>
          </>
        }
      />
    </section>
  );
}
