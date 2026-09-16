import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Every custom `--text-*` name in `styles/tokens.css`'s `@theme inline` block
 * (fixed interface sizes and the fluid heading scale alike), which Tailwind
 * generates a `text-*` utility from.
 *
 * tailwind-merge only knows the stock sizes, so without this list it reads
 * a name like `text-small` or `text-step-2` as a *colour* and drops whatever
 * real colour it is merged with. Keep in step with tokens.css.
 */
const FLUID_TEXT_SIZES = [
  'nano',
  'tiny',
  'label',
  'micro',
  'meta',
  'caption',
  'ui',
  'small',
  'body',
  'lead',
  'step-0',
  'step-1',
  'step-2',
  'step-3',
  'display-1',
  'display-2',
  'display-3',
  'display-4',
  'display-5',
  'display-6',
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
