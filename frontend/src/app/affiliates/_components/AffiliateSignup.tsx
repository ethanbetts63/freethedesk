import { AffiliateSignupForm } from './AffiliateSignupForm';

/**
 * The affiliate sign-up, straight under the hero bar as the order forms are on the service
 * pages. Top padding only: the section after it opens with its own `pt-section`. Server shell:
 * only the panel hydrates.
 */
export function AffiliateSignup({ share }: { share: string }) {
  return (
    <section className="pt-section" id="signup" aria-label="Sign up">
      <div className="site-shell">
        <AffiliateSignupForm share={share} />
      </div>
      {/* Where the page's floating call to action may appear: past the whole form. */}
      <div id="signup-end" aria-hidden="true" />
    </section>
  );
}
