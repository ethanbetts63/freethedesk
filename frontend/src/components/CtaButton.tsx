import Link from "next/link";

export type CtaButtonProps = {
  children: React.ReactNode;
  /** Renders a Link when set, a <button> otherwise. */
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  /** Trailing glyph. Pass null for a label-only button. */
  arrow?: string | null;
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
  arrow = "→",
  baseClass,
}: CtaButtonProps & { baseClass: string }) {
  const content = (
    <>
      {children}
      {arrow && <span aria-hidden="true">{arrow}</span>}
    </>
  );
  const classes = `${baseClass} ${className}`.trim();

  if (href) {
    return (
      <Link className={classes} href={href}>
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
