import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import { TEXT_SIZES } from './text-sizes.generated';

/**
 * tailwind-merge only knows Tailwind's stock sizes, so without this list it
 * reads a custom name like `text-body-sm` or `text-title-sm` as a *colour* and
 * drops whatever real colour it is merged with.
 *
 * The names come straight out of tokens.css's `@theme inline` block — see
 * `text-sizes.generated.ts` — so there is nothing here to keep in step by hand.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...TEXT_SIZES] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
