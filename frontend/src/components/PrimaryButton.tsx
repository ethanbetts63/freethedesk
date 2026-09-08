import { CtaButton, type CtaButtonProps } from "./CtaButton";

/**
 * The site's standard accent CTA: accent background, white text, sliding arrow.
 * Styling lives in the global `.primary-button` class; per-use sizing, spacing
 * and colour are set through the `--pb-*` custom properties from a module class
 * passed in as `className`.
 */
export function PrimaryButton(props: CtaButtonProps) {
  return <CtaButton {...props} baseClass="primary-button" />;
}
