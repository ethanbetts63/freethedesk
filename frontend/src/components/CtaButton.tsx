import Link from "next/link";

/**
 * Where the click takes you, which decides the glyph. Same-page anchors point
 * the way the page will scroll, so the arrow always matches the movement:
 * `down` for a target further down, `up` for one above. `page` is a link to
 * somewhere else entirely, `right` advances a form without scrolling, and
 * `none` omits the glyph.
 */
export type CtaDirection = "down" | "up" | "page" | "right" | "none";

const ARROWS: Record<Exclude<CtaDirection, "none">, string> = {
  down: "↓",
  up: "↑",
  page: "↗",
  right: "→",
};

export type CtaButtonProps = {
  children: React.ReactNode;
  /** Renders a Link when set, a <button> otherwise. */
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  target?: "_blank" | "_self";
  rel?: string;
  /** Defaults to `page`; submit buttons should pass `none` or leave it. */
  direction?: CtaDirection;
};

/**
 * Shared plumbing for the site's two CTA styles. Not used directly—render
 * `PrimaryButton` or `MovingColourButton`, which supply the base class.
 */
export function CtaButton({
  children,
  href,
  type = "button",
  disabled = false,
  className = "",
  target,
  rel,
  direction = "page",
  baseClass,
}: CtaButtonProps & { baseClass: string }) {
  const content = (
    <>
      {children}
      {direction !== "none" && <span aria-hidden="true">{ARROWS[direction]}</span>}
    </>
  );
  const classes = `${baseClass} ${className}`.trim();

  if (href) {
    return (
      <Link className={classes} href={href} target={target} rel={rel}>
        {content}
      </Link>
    );
  }
  return (
    <button className={classes} type={type} disabled={disabled}>
      {content}
    </button>
  );
}
