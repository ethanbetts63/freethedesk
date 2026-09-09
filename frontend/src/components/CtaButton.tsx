import Link from "next/link";

/**
 * Which glyph the CTA shows. In-page anchors use the scroll direction (`down` /
 * `up`); `page` links elsewhere, `right` advances a form, `none` omits it.
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
  /** Defaults to `page`; submit buttons should pass `none`. */
  direction?: CtaDirection;
};

/** Shared plumbing for the two CTA styles; render `PrimaryButton` or `MovingColourButton`, not this. */
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
