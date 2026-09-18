import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Every custom `--text-*` name in `styles/tokens.css`'s `@theme inline` block
 * (fixed interface sizes and the fluid heading scale alike), which Tailwind
 * generates a `text-*` utility from.
 *
 * tailwind-merge only knows the stock sizes, so without this list it reads
 * a name like `text-body-sm` or `text-title-sm` as a *colour* and drops whatever
 * real colour it is merged with. Keep in step with tokens.css.
 */
const FLUID_TEXT_SIZES = [
  'caption-xs',
  'caption-sm',
  'caption',
  'label',
  'body-sm',
  'body',
  'lead',
  'glyph',
  'wordmark',
  'body-lg',
  'body-xl',
  'title-sm',
  'title',
  'display-sm',
  'display',
  'display-md',
  'display-lg',
  'hero',
  'hero-lg',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FLUID_TEXT_SIZES }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
