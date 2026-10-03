import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

/**
 * The type size and the logo that goes with it. Only the size changes between
 * placements; the logo, colours, weight and tracking are the same everywhere.
 */
const sizes = {
  /** The site header, the footer and the checkout's top corner. */
  nav: {
    text: 'text-title-sm',
    image: 'h-[46px] w-[46px] lg:h-[40px] lg:w-[40px]',
    px: 40,
  },
  /** The dashboard sidebar and the sign-in card. */
  // eslint-disable-next-line no-restricted-syntax -- 1.45rem is the logotype size, deliberately off the type scale.
  card: { text: 'text-[1.45rem]', image: 'h-[32px] w-[32px]', px: 32 },
  /** The quarter-size phone mock-ups. */
  mini: { text: 'text-caption', image: 'h-[16px] w-[16px]', px: 16 },
} as const;

/**
 * The freethedesk logo and wordmark. With `href` it is a link (home, or the
 * portal's home); without, a plain mark for previews and mock-ups.
 */
export function Wordmark({
  size = 'nav',
  href,
  priority = false,
  className,
}: {
  size?: keyof typeof sizes;
  href?: string;
  priority?: boolean;
  className?: string;
}) {
  const { text, image, px } = sizes[size];
  const classes = cn(
    'flex w-fit flex-none items-center gap-xs leading-none font-black tracking-[-0.085em]',
    text,
    className,
  );
  const content = (
    <>
      {/* The transparent cut of the favicon artwork, so no white square shows
          on the tinted sidebar, sign-in and checkout surfaces. */}
      <Image
        className={cn('block object-contain', image)}
        src="/logo-mark.png"
        alt=""
        width={px}
        height={px}
        priority={priority}
      />
      <span className="text-text-primary">
        free<span className="text-text-action">the</span>desk
        <span className="text-action-primary">.</span>
      </span>
    </>
  );

  return href ? (
    <Link className={classes} href={href}>
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  );
}
