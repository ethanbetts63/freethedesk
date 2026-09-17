import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * The feedback messages shared by the dashboard, both portals and the login
 * page: the status/error/warning banners that sit under a page header, and the
 * small error that sits inside a form.
 *
 * Replaces the `.admin-banner` / `.admin-banner-error` / `.admin-banner-warning`
 * / `.admin-form-error` classes from `admin.css`. Those were a base plus two
 * override classes, so a caller wrote the palette twice
 * (`"admin-banner admin-banner-error"`) and the plain base quietly meant
 * "success". Here the tone is one named prop with no default worth guessing at,
 * and `size` carries the two shapes the original CSS had: a banner with its own
 * vertical rhythm, and a flush field-level error.
 *
 * `.admin-form-error` was also declared twice in `admin.css`, the second copy
 * repeating the danger palette it already inherited from the first. Both are
 * gone; `<AdminNotice tone="danger" size="field">` is the whole of it now.
 */
const adminNoticeVariants = cva('border', {
  variants: {
    tone: {
      success: 'border-border-success bg-surface-success text-text-success',
      warning: 'border-border-warning bg-surface-warning text-text-warning',
      danger: 'border-border-danger bg-surface-danger text-text-danger',
    },
    size: {
      banner: 'my-m rounded-sm p-s text-ui leading-[1.5]',
      field: 'm-0 rounded-[var(--radius-xs)] p-xs text-caption',
    },
  },
  defaultVariants: { tone: 'success', size: 'banner' },
});

export type AdminNoticeTone = NonNullable<VariantProps<typeof adminNoticeVariants>['tone']>;

type AdminNoticeProps = Omit<HTMLAttributes<HTMLParagraphElement>, 'className'> &
  VariantProps<typeof adminNoticeVariants> & {
    children: ReactNode;
    className?: string;
  };

export function AdminNotice({ tone, size, className, children, ...rest }: AdminNoticeProps) {
  return (
    <p className={cn(adminNoticeVariants({ tone, size }), className)} {...rest}>
      {children}
    </p>
  );
}
