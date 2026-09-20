import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { LinkOrButton, type LinkOrButtonProps } from '@/components/common/LinkOrButton';
import {
  disabledBusyClassName,
  disabledUnavailableClassName,
  focusRingClassName,
} from '@/lib/controlState';
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
 * The pay bar is disabled for two different reasons — the terms are not
 * accepted yet, and the payment is in flight — so which disabled treatment it
 * takes is the `busy` prop rather than the variant. Both treatments come from
 * `lib/controlState.ts`, shared with the other two button families.
 */
const checkoutButtonVariants = cva(
  [
    'cursor-pointer border-0 bg-action-primary font-[inherit] text-body-sm font-black text-text-on-dark',
    focusRingClassName,
    // The trailing arrow, when a caller renders one: a <b> beside the label
    // rather than a glyph this component owns, because the label is itself a
    // <span> whose text swaps while the payment is in flight.
    '[&>b]:text-lead',
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
      /** Disabled because the payment is in flight, rather than not yet offered. */
      busy: {
        true: disabledBusyClassName,
        false: disabledUnavailableClassName,
      },
    },
    defaultVariants: { variant: 'submit', busy: false },
  },
);

export type CheckoutButtonVariant = NonNullable<
  VariantProps<typeof checkoutButtonVariants>['variant']
>;

type SharedProps = {
  children: ReactNode;
  variant?: CheckoutButtonVariant;
  busy?: boolean;
  className?: string;
};

export function CheckoutButton(props: LinkOrButtonProps<SharedProps>) {
  const { children, variant, busy, className, ...rest } = props;
  return (
    <LinkOrButton classes={cn(checkoutButtonVariants({ variant, busy }), className)} {...rest}>
      {children}
    </LinkOrButton>
  );
}
