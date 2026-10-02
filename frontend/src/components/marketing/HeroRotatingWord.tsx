'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { cn } from '@/lib/utils';

const ROTATE_EVERY_MS = 3200;

const subscribeNever = () => () => {};

/**
 * The hero's accent line, cycling through alternatives after hydration.
 *
 * The server renders only the first word, so the h1 in the HTML - the one
 * crawlers and link previews read - is a single clean sentence. The stack of
 * alternatives only exists in the browser.
 *
 * Every word sits in the same grid cell, so the line takes the size of the
 * longest one and the lead below never jumps as the words change. The outgoing
 * word rises out while the incoming one rises in from below; words waiting
 * their turn reset without a transition, so nothing ever slides backwards.
 * Reduced motion keeps the first word and never rotates.
 */
export function HeroRotatingWord({ words }: { words: readonly string[] }) {
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % words.length),
      ROTATE_EVERY_MS,
    );
    return () => window.clearInterval(timer);
  }, [words.length]);

  if (!hydrated || words.length < 2) return <>{words[0]}</>;

  const previous = (active - 1 + words.length) % words.length;

  return (
    <span className="inline-grid">
      {words.map((word, index) => (
        <span
          key={word}
          aria-hidden={index !== active}
          className={cn(
            'col-start-1 row-start-1 motion-reduce:transition-none',
            index === active &&
              'translate-y-0 opacity-100 transition-[opacity,transform] duration-700 ease-out',
            index === previous &&
              '-translate-y-1/3 opacity-0 transition-[opacity,transform] duration-1000 ease-out',
            index !== active && index !== previous && 'translate-y-1/3 opacity-0 transition-none',
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
