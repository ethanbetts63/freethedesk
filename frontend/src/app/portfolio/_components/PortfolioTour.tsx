"use client";

import { KeyboardEvent, useId, useRef, useState } from "react";

import { BrowserFrame } from "./BrowserFrame";

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

/** Vertical tablist: Up/Down move between tabs, Home/End jump to the ends. */
const KEY_OFFSETS: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

export function PortfolioTour({ label, browserUrl, items }: PortfolioTourProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const base = `portfolio-tour-${useId().replaceAll(":", "")}`;
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
    if (event.key === "Home") {
      event.preventDefault();
      select(0);
      return;
    }
    if (event.key === "End") {
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
    <div className="case-tour">
      <div
        className="case-tour-controls"
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
            className={activeIndex === index ? "active" : undefined}
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
            <i>{activeIndex === index ? "—" : "+"}</i>
          </button>
        ))}
      </div>

      <div className="case-tour-preview" id={panelId} role="tabpanel" aria-labelledby={tabId(activeIndex)} tabIndex={0}>
        <BrowserFrame
          image={{
            src: active.src,
            alt: active.alt,
            width: active.width,
            height: active.height,
            className: "case-tour-image",
          }}
          browserUrl={browserUrl}
        />
        <a href={active.url} target="_blank" rel="noreferrer">
          {active.linkLabel} <span>↗</span>
        </a>
      </div>
    </div>
  );
}
