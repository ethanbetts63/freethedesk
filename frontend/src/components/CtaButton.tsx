import Link from "next/link";

import { ScrollCtaButton } from "./ScrollCtaButton";

/**
 * Which glyph the CTA shows. In-page anchors use the scroll direction (`down` /
 * `up`); `page` links elsewhere, `right` advances a form, `none` omits it.
 */
export type CtaDirection = "down" | "up" | "page" | "right" | "none";
export type CtaAppearance = "brand" | "dark" | "light" | "ghost";
export type CtaSize = "compact" | "default" | "large";

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
  appearance?: CtaAppearance;
  size?: CtaSize;
  fullWidth?: boolean;
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
  appearance = "brand",
  size = "default",
  fullWidth = false,
  baseClass,
}: CtaButtonProps & { baseClass: string }) {
  const content = (
    <>
      {children}
      {direction !== "none" && <span aria-hidden="true">{ARROWS[direction]}</span>}
    </>
  );
  const classes = [
    "cta-button",
    baseClass,
    `cta-${appearance}`,
    `cta-${size}`,
    fullWidth ? "cta-full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // A bare "#fragment" is an in-page scroll, not navigation: render a button
  // that drives the scroll itself so it works on every click and leaves the URL
  // alone. Real routes (including "/path#fragment") still go through Link.
  if (href?.startsWith("#")) {
    return (
      <ScrollCtaButton targetId={href.slice(1)} className={classes}>
        {content}
      </ScrollCtaButton>
    );
  }
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
