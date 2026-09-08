import { CtaButton, type CtaButtonProps } from "./CtaButton";

/**
 * The moving-colour CTA, reserved for the one headline action in a section.
 * Styling lives in the global `.moving-colour-button` class; per-use sizing is
 * set through the `--mcb-*` custom properties from a module class passed in as
 * `className`.
 */
export function MovingColourButton(props: CtaButtonProps) {
  return <CtaButton {...props} baseClass="moving-colour-button" />;
}
