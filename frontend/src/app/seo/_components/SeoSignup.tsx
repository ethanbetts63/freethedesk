import { type PublicSiteSettings } from '@/lib/api';
import { SeoSignupPanel } from './SeoSignupPanel';

/**
 * The SEO order form, straight under the hero bar as on the other service pages. Top padding
 * only: the section after it opens with its own `pt-section`, so the form sits one section's
 * space from the bar above and from what follows. Server shell: only the panel hydrates.
 */
export function SeoSignup({ settings }: { settings: PublicSiteSettings }) {
  return (
    <section className="pt-section [scroll-margin-top:24px]" id="signup" aria-label="Plans">
      <div className="site-shell">
        <SeoSignupPanel settings={settings} />
      </div>
      {/* Where the page's floating call to action may appear: past the whole order form. */}
      <div id="signup-end" aria-hidden="true" />
    </section>
  );
}
