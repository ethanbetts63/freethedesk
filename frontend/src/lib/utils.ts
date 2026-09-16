import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The fluid heading scale from `styles/tokens.css`, exposed via `@theme
 * inline` under its raw step/display names.
 *
 * tailwind-merge only knows the stock sizes, so without this list it reads
 * `text-step-2` or `text-display-3` as a *colour* and drops whatever real
 * colour it is merged with. Keep in step with tokens.css.
 */
const FLUID_TEXT_SIZES = [
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
