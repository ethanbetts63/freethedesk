import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * A control's own props when it renders a `<button>` — `href` is forbidden, so
 * the union below discriminates on its presence.
 */
export type AsButton<Own> = Own &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: never };

/** The same control's props when it renders a `Link`. */
export type AsLink<Own> = Own &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & { href: string };

export type LinkOrButtonProps<Own> = AsButton<Own> | AsLink<Own>;

/**
 * Renders a `Link` when `href` is set and a `<button>` otherwise, forwarding
 * whichever element's attributes the caller passed.
 *
 * The three button families — `AdminButton`, `CheckoutButton` and `CtaButton` —
 * each used to carry their own copy of this branch. They still own their own
 * variants, because a dashboard button, a pay bar and a marketing CTA are
 * different design decisions; what they share is only how the element is
 * chosen, which is what lives here.
 *
 * `className` is intentionally absent from both halves of the union: callers
 * resolve their variants first and pass the result as `classes`, so there is no
 * second class list arriving late and winning by accident.
 */
export function LinkOrButton({
  children,
  classes,
  ...rest
}: LinkOrButtonProps<{ children: ReactNode; classes: string }>) {
  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    return (
      <Link className={classes} href={href} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} type={type} {...buttonProps}>
      {children}
    </button>
  );
}
