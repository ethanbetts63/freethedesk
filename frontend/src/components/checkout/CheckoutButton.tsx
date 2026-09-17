import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * The button family of the checkout flows: the pay bar, the retry control on a
 * failed lookup, and the two action links on the post-payment screen.
 *
 * It is deliberately not `CtaButton`. The marketing CTA is a justify-between
 * box with an uppercase label, a tracked letterspacing, a hover fill and a
 * sliding arrow; this one is a flush-left bar with a sentence-case label and an
 * oversized arrow beside it, and converging them would be a redesign of the
 * checkout rather than a migration of it (principle 4). What is removed is the
 * duplication: the same declarations were written out three times across two
 * files, once per shape.
 *
 * The disabled treatment sits in the base rather than on `submit`, the only
 * variant that was ever given one. It is inert until a caller disables a
 * button, and one family should not have two answers to the same state.
 */
const checkoutButtonVariants = cva(
  [
    'cursor-pointer border-0 bg-action-primary font-[inherit] text-small font-black text-text-on-dark',
    'disabled:cursor-not-allowed disabled:opacity-45',
    // The trailing arrow, when a caller renders one: a <b> beside the label
    // rather than a glyph this component owns, because the label is itself a
    // <span> whose text swaps while the payment is in flight.
    '[&>b]:text-step-0',
  ],
  {
    variants: {
      variant: {
        /** The pay bar: full width, 60px tall, label and arrow flush left. */
        submit: 'flex min-h-[60px] w-full items-center px-ml',
        /** The same bar, capped and centred, for a one-word recovery action. */
        retry: 'flex min-h-[60px] w-full max-w-[190px] items-center justify-center px-ml',
        /** Sits in a centred column of text on the confirmation screen. */
        link: 'inline-block px-l py-m',
      },
    },
    defaultVariants: { variant: 'submit' },
  },
);

export type CheckoutButtonVariant = NonNullable<
  VariantProps<typeof checkoutButtonVariants>['variant']
>;

type SharedProps = {
  children: ReactNode;
  variant?: CheckoutButtonVariant;
  className?: string;
};

type AsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: never };

type AsLink = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & { href: string };

/** Renders a Link when `href` is set, a <button> otherwise. */
export function CheckoutButton(props: AsButton | AsLink) {
  const { children, variant, className, ...rest } = props;
  const classes = cn(checkoutButtonVariants({ variant }), className);

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
