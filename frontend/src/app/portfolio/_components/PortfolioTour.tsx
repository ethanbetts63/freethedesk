'use client';

import { KeyboardEvent, useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { BrowserFrame } from './BrowserFrame';

export type PortfolioTourItem = {
  number: string;
  label: string;
  title: string;
  copy: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  url: string;
  linkLabel: string;
};

type PortfolioTourProps = {
  label: string;
  browserUrl: string;
  items: readonly PortfolioTourItem[];
};

/** Arrow-key step offsets for the vertical tablist. */
const KEY_OFFSETS: Record<string, number> = {
  ArrowDown: 1,
  ArrowRight: 1,
  ArrowUp: -1,
  ArrowLeft: -1,
};

/**
 * A tab stacks under its screenshot on a phone and sits beside it from `lg`,
 * where the panel also becomes sticky. The selected tab is a filled card: the
 * padding changes with it, which is why the transition names padding too.
 */
const tabClassName = [
  'grid w-full cursor-pointer grid-cols-[28px_minmax(0,1fr)_20px] items-start gap-m',
  'border-0 border-t border-border-strong bg-transparent text-left',
  'transition-[background,padding] duration-200',
  '[&>span]:pt-4xs [&>span]:text-caption-sm [&>span]:font-black [&>span]:text-text-action',
  '[&_small]:mb-2xs [&_small]:block [&_small]:text-caption-sm [&_small]:font-heavy [&_small]:tracking-label [&_small]:text-text-subtle [&_small]:uppercase',
  '[&_strong]:block [&_strong]:text-body-lg [&_strong]:leading-[1.2] [&_strong]:tracking-[-0.025em]',
  '[&_p]:mt-s [&_p]:mb-0 [&_p]:text-body-sm [&_p]:leading-[1.58] [&_p]:text-text-muted',
  '[&>i]:text-right [&>i]:text-body-lg [&>i]:not-italic',
].join(' ');

export function PortfolioTour({ label, browserUrl, items }: PortfolioTourProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const base = `portfolio-tour-${useId().replaceAll(':', '')}`;
  const panelId = `${base}-panel`;
  const tabId = (index: number) => `${base}-tab-${index}`;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = items[activeIndex];

  if (!active) return null;

  function select(index: number) {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Home') {
      event.preventDefault();
      select(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      select(items.length - 1);
      return;
    }
    const offset = KEY_OFFSETS[event.key];
    if (!offset) return;
    event.preventDefault();
    select((activeIndex + offset + items.length) % items.length);
  }

  return (
    // Column-reverse on a phone so the screenshot leads; two columns from lg,
    // where `lg:grid` retires the flex direction above it.
    <div className="flex flex-col-reverse items-start gap-xl lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] xl:gap-2xl">
      <div
        className="w-full border-b border-border-strong lg:w-auto"
        role="tablist"
        aria-label={label}
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {items.map((item, index) => (
          <button
            key={item.number}
            id={tabId(index)}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            className={cn(
              tabClassName,
              activeIndex === index ? 'bg-surface-page px-m py-l' : 'pt-ml pr-3xs pb-ml pl-0',
            )}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={panelId}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => setActiveIndex(index)}
          >
            <span>{item.number}</span>
            <div>
              <small>{item.label}</small>
              <strong>{item.title}</strong>
              {activeIndex === index && <p>{item.copy}</p>}
            </div>
            <i>{activeIndex === index ? '—' : '+'}</i>
          </button>
        ))}
      </div>

      <div
        className="top-[112px] w-full lg:sticky lg:w-auto"
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(activeIndex)}
        tabIndex={0}
      >
        <BrowserFrame
          image={{
            src: active.src,
            alt: active.alt,
            width: active.width,
            height: active.height,
            // Fades the new screenshot in when a tab changes; the keyframe is
            // in styles/motion.css with the rest of the animation vocabulary.
            className: 'animate-[case-image-in_0.35s_ease_both]',
          }}
          browserUrl={browserUrl}
        />
        <a
          className="mt-m inline-flex gap-m border-b border-text-primary pb-3xs text-label font-heavy lg:float-right"
          href={active.url}
          target="_blank"
          rel="noreferrer"
        >
          {active.linkLabel} <span>↗</span>
        </a>
      </div>
    </div>
  );
}
